# Thesis viewer

Minimal COPC viewer that wraps a stripped down version of Potree.

1. Install RangeHTTPServer

```bash
pip install RangeHTTPServer
```

2. Start a static server from `Viewer/` with Range support (required for taking advantage of COPC):

```bash
python -m RangeHTTPServer 8000
```

3. Open:
- `http://localhost:8000/`

Use the dropdown to switch between Groningen and Delft. You can also open `http://localhost:8000/?demo=delft` directly.