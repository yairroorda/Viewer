# Thesis viewer

Minimal COPC viewer that wraps a stripped down version of Potree.

1. Install RangeHTTPServer (required for taking advantage of COPC):

```bash
pip install -r requirements.txt
```

2. To test locally, start a static server from `Viewer/`:

```bash
python -m RangeHTTPServer 8080
```

3. Open:
- `http://localhost:8080/`

Use the dropdown to switch between Groningen and Delft. You can also open `http://localhost:8000/?demo=delft` directly.