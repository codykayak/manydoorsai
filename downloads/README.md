# Social Post Factory — download

Standalone FB / IG / X auto-posting tool (extracted for **AiBhive**).

## Download options

### 1. Firebase Storage (after CI upload)

**Firebase Console → Storage** (`property-managment-a5ed3`):

```
exports/social-post-factory.zip
```

Or **Firestore** doc `exports/socialPostFactory` — field `downloadUrl`.

Direct URL (once upload workflow runs):

https://storage.googleapis.com/property-managment-a5ed3.firebasestorage.app/exports/social-post-factory.zip

### 2. GitHub

Raw zip from this repo:

https://github.com/codykayak/manydoorsai/raw/main/downloads/social-post-factory.zip

### 3. GitHub Actions artifact

Actions → **Upload social-post-factory export** → latest run → artifact `social-post-factory`.

## Install into AiBhive

```bash
unzip social-post-factory.zip -d /path/to/AiBhive/
# Creates: /path/to/AiBhive/social-post-factory/
```

See `social-post-factory/README.md` inside the zip for Firebase secrets and admin UI setup.

---

# Communal Library expansion — download

90 public-domain seed plates (10 categories × 10 items) for **AiBhive Research Lab** [Communal Library](https://aibhive.com/research-lab/communal-library).

Categories: hieroglyphics, cuneiform, mud flood, tartarian, orphan trains, legal research, homeopathic cures, mycology, quantum physics.

## Download

Raw zip from this repo:

https://github.com/codykayak/manydoorsai/raw/main/downloads/communal-library.zip

Or build locally:

```bash
./scripts/build-communal-library-export.sh
```

## Install into AiBhive

```bash
unzip communal-library.zip -d /path/to/AiBhive/
# Follow AiBhive/communal-library/README.md — copy images + merge seed data, then redeploy.
```
