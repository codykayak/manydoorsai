import ProsHqPanel from './ProsHqPanel';

/** Company HQ — ManyDoors-branded Pros admin (no aibhive.com iframe). */
export default function ProsAppEmbed({ embedded = false }) {
  return <ProsHqPanel embedded={embedded} />;
}
