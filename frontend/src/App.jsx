import { useEffect, useState } from "react";

function App() {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [received, setReceived] = useState([]);

  const [peerId] = useState(
    Math.random().toString(36).substring(2, 8)
  );

  const [targetPeer, setTargetPeer] = useState("");

  useEffect(() => {
    const ws = new WebSocket(
      "https://routing-backend-5dmc.onrender.com/"
    );

    ws.onopen = () => {
      console.log("Connected");

      ws.send(
        JSON.stringify({
          type: "register",
          peerId: peerId
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      setReceived((prev) => [
        ...prev,
        `${data.from}: ${data.payload}`
      ]);
    };

    setSocket(ws);

    return () => ws.close();
  }, [peerId]);

  const sendMessage = () => {
    if (!socket) return;

    socket.send(
      JSON.stringify({
        type: "relay",
        from: peerId,
        to: targetPeer,
        payload: message
      })
    );

    setMessage("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Routing Server</h1>

      <h3>Your Peer ID</h3>
      <p>{peerId}</p>

      <input
        placeholder="Target Peer ID"
        value={targetPeer}
        onChange={(e) =>
          setTargetPeer(e.target.value)
        }
      />

      <br />
      <br />

      <input
        placeholder="Message"
        value={message}
        onChange={(e) =>
          setMessage(e.target.value)
        }
      />

      <button
        onClick={sendMessage}
        style={{ marginLeft: "10px" }}
      >
        Send
      </button>

      <h3>Messages</h3>

      {received.map((msg, index) => (
        <div key={index}>{msg}</div>
      ))}
    </div>
  );
}

export default App;