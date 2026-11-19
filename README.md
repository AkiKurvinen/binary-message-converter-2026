# Binary Message Converter

A dependency-free static website that repeatedly transmits a message as colors.
Open `index.html` in a browser, or publish the repository root with GitHub Pages.

Enter an eight-digit binary start byte and a message, choose a color mode and
timing, then select **Start transmitting**. Stop transmission before changing
settings. The default settings match the Arduino example: start byte `11110011`,
message `@`, red/green mode, 700 ms per bit, and a 100 ms dark gap within each bit.

Each frame consists of the start byte followed by the message encoded as UTF-8.
Bytes are sent most significant bit first. After each frame the swatch stays dark
for two bit durations plus 200 ms, then the frame repeats. An empty message sends
only the start byte.

| Mode | 1 | 0 |
| --- | --- | --- |
| Red / green | Red | Green |
| Green / blue | Green | Blue |
| Blue / red | Blue | Red |
| Bright / dim white | White (255) | Dim white (40) |

Flashing colors may affect people with photosensitive conditions. Browser timers
are not precise, particularly in background tabs; keep the page visible when
transmitting.
