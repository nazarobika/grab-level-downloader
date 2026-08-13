from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import webbrowser


HOST = "127.0.0.1"
PORT = 8000

ROOT = Path(__file__).resolve().parent


class Handler(SimpleHTTPRequestHandler):

    def __init__(self, *args, **kwargs):
        super().__init__(
            *args,
            directory=str(ROOT),
            **kwargs
        )


def main():

    server = ThreadingHTTPServer(
        (HOST, PORT),
        Handler
    )

    url = f"http://{HOST}:{PORT}"

    print()
    print("grab vr sublevel extractor")
    print("---------------------------")
    print(f"running at {url}")
    print("press ctrl+c to stop")
    print()

    try:
        webbrowser.open(url)
    except Exception:
        pass

    try:
        server.serve_forever()

    except KeyboardInterrupt:
        print()
        print("stopping server...")

    finally:
        server.server_close()


if __name__ == "__main__":
    main()
