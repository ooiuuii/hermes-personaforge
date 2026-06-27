# Asset Policy

This project is designed so the public repo can be submitted safely.

Allowed in Git:

- generic persona manifest fields,
- redacted payment proof,
- generated JSON proof artifacts,
- React/Vite demo code,
- scripts for recording and mixing demo video,
- documentation and submission copy.

Not allowed in Git:

- third-party `.char` packages,
- `.ckpt`, `.pth`, `.onnx`, `.safetensors` model files,
- sprite image files,
- voice samples,
- local Shinsekai runtime code when its license does not allow redistribution,
- raw payment screenshots,
- customer PII,
- credentials or keys.

Suggested local-only paths:

```text
artifacts/local-character-packs/
artifacts/runtime-captures/
```

The `.gitignore` also blocks common character/model/audio file extensions.
