import { useCallback, useEffect, useRef, useState } from 'react';
import { usePm } from '../context/PmContext';
import Icon from './Icon';
import { sendPmChatMessage, createPmVoiceSession } from '../lib/pmChatClient';
import { startGrokVoiceCall } from '../lib/grokVoiceCall';
import { GROK_VOICE_PHONE_DISPLAY, GROK_VOICE_PHONE_E164 } from '../config/voiceContact';
import cb from './siteChatbot.module.css';

const WELCOME =
  `Hi! I'm Grok — your ManyDoors AI assistant. Ask me about our product, ROI, integrations, or property settings. Hit Call for a live voice demo in the browser, or dial ${GROK_VOICE_PHONE_DISPLAY} to talk to me on the phone.`;

const CALL_STATUS = {
  idle: '',
  connecting: 'Calling Grok…',
  listening: 'Listening',
  thinking: 'Thinking…',
  speaking: 'Grok is speaking',
  error: 'Call issue',
};

export default function SiteChatbot({ open, onOpenChange }) {
  const { config, propertyProfile } = usePm();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([{ role: 'assistant', content: WELCOME }]);
  const [callStatus, setCallStatus] = useState('idle');
  const [muted, setMuted] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const callRef = useRef(null);
  const inCall = callStatus !== 'idle' && callStatus !== 'error';

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open, loading, callStatus]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const hangup = useCallback(() => {
    callRef.current?.hangup();
    callRef.current = null;
    setCallStatus('idle');
    setMuted(false);
  }, []);

  useEffect(() => {
    return () => {
      callRef.current?.hangup();
      callRef.current = null;
    };
  }, []);

  const appendTranscript = useCallback((entry) => {
    const text = entry?.content?.trim();
    if (!text) return;
    const role = entry.role;
    const itemId = entry.itemId;
    setMessages((prev) => {
      if (itemId) {
        const idx = prev.findLastIndex((m) => m.itemId === itemId && m.role === role);
        if (idx >= 0) {
          if (prev[idx].content === text) return prev;
          const next = [...prev];
          next[idx] = { ...prev[idx], content: text };
          return next;
        }
      }
      const last = prev[prev.length - 1];
      if (last?.channel === 'voice' && last.role === role) {
        if (last.content === text) return prev;
        const sameItem = itemId && last.itemId && itemId === last.itemId;
        const revised =
          text.startsWith(last.content) || last.content.startsWith(text);
        if (sameItem || revised) {
          return [
            ...prev.slice(0, -1),
            { ...last, content: text, itemId: itemId || last.itemId },
          ];
        }
      }
      if (prev.slice(-8).some((m) => m.role === role && m.channel === 'voice' && m.content === text)) {
        return prev;
      }
      return [...prev, { role, content: text, channel: 'voice', itemId }];
    });
  }, []);

  const startCall = useCallback(async () => {
    if (inCall || callStatus === 'connecting') return;
    setError(null);
    setCallStatus('connecting');
    onOpenChange(true);
    try {
      const session = await createPmVoiceSession(propertyProfile);
      const history = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .filter((m, i) => !(i === 0 && m.role === 'assistant' && m.content === WELCOME));
      const call = startGrokVoiceCall({
        session,
        chatHistory: history,
        onTranscript: appendTranscript,
        onStatus: (status, extra) => {
          if (status === 'idle') {
            setCallStatus('idle');
            setMuted(false);
            callRef.current = null;
            return;
          }
          if (status === 'error') {
            setError(typeof extra === 'string' ? extra : 'Voice call hit a snag.');
            setCallStatus((prev) => (prev === 'idle' || prev === 'connecting' ? 'listening' : prev));
            return;
          }
          if (status === 'listening' || status === 'speaking') {
            setError(null);
          }
          setCallStatus(status);
        },
      });
      callRef.current = call;
      await call.started;
    } catch (e) {
      hangup();
      setCallStatus('idle');
      setError(e.message || 'Could not start the Grok voice call.');
    }
  }, [appendTranscript, callStatus, hangup, inCall, messages, onOpenChange, propertyProfile]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    callRef.current?.setMuted(next);
  };

  const closePanel = () => {
    hangup();
    onOpenChange(false);
  };

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading || inCall) return;

    const next = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const apiMessages = next
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .filter((m, i) => !(i === 0 && m.role === 'assistant' && m.content === WELCOME))
        .map((m) => ({ role: m.role, content: m.content }));

      const reply = await sendPmChatMessage(apiMessages, propertyProfile);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      setError(e.message || 'Could not reach the chat service.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Sorry — I could not connect right now. Email ${config.supportEmail} or try again in a moment.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [config.supportEmail, inCall, input, loading, messages, propertyProfile]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className={cb.root}>
      {open && (
        <div className={cb.panel} role="dialog" aria-label={`${config.productName} assistant`}>
          <header className={cb.head}>
            <div>
              <div className={cb.title}>{config.productName} Assistant</div>
              <div className={cb.sub}>
                {inCall
                  ? CALL_STATUS[callStatus] || 'On a live Grok voice call'
                  : (
                    <>
                      Powered by Grok · or call{' '}
                      <a className={cb.dial} href={`tel:${GROK_VOICE_PHONE_E164}`}>
                        {GROK_VOICE_PHONE_DISPLAY}
                      </a>
                    </>
                  )}
              </div>
            </div>
            <div className={cb.headActions}>
              {inCall ? (
                <>
                  <button
                    type="button"
                    className={cb.iconBtn}
                    onClick={toggleMute}
                    aria-pressed={muted}
                    aria-label={muted ? 'Unmute microphone' : 'Mute microphone'}
                    title={muted ? 'Unmute' : 'Mute'}
                  >
                    <Icon name={muted ? 'micOff' : 'mic'} size={16} />
                  </button>
                  <button type="button" className={cb.hangup} onClick={hangup} aria-label="Hang up">
                    <Icon name="phone" size={14} />
                    Hang up
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className={cb.call}
                  onClick={startCall}
                  disabled={callStatus === 'connecting'}
                  aria-label="Start Grok voice call"
                >
                  <Icon name="phone" size={14} />
                  Call
                </button>
              )}
              <button
                type="button"
                className={cb.close}
                onClick={closePanel}
                aria-label="Close chat"
              >
                ×
              </button>
            </div>
          </header>

          {inCall && (
            <div className={`${cb.callBar} ${cb[`callBar_${callStatus}`] || ''}`} role="status">
              <span className={cb.callDot} />
              {muted ? 'Muted — Grok cannot hear you' : CALL_STATUS[callStatus] || 'On call'}
            </div>
          )}

          <div className={cb.messages} ref={listRef}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`${m.role === 'user' ? cb.bubbleUser : cb.bubbleBot} ${m.channel === 'voice' ? cb.bubbleVoice : ''}`}
              >
                {m.channel === 'voice' && <span className={cb.voiceTag}>Call</span>}
                {m.content}
              </div>
            ))}
            {loading && <div className={cb.typing}>Thinking…</div>}
            {error && <div className={cb.errorHint}>{error}</div>}
          </div>

          <div className={cb.composer}>
            <textarea
              ref={inputRef}
              className={cb.input}
              rows={2}
              placeholder={
                inCall
                  ? 'You are on a voice call — speak, or hang up to type.'
                  : 'Ask about ManyDoors, ROI, maintenance, or hit Call…'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={loading || inCall}
            />
            <button type="button" className={cb.send} onClick={send} disabled={loading || inCall || !input.trim()}>
              <Icon name="bolt" size={16} />
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        className={`${cb.fab} ${inCall ? cb.fabLive : ''}`}
        onClick={() => (open ? closePanel() : onOpenChange(true))}
        aria-expanded={open}
        aria-label={open ? 'Close chat' : 'Open chat assistant'}
      >
        <Icon name={inCall ? 'phone' : 'chat'} size={22} />
      </button>
    </div>
  );
}
