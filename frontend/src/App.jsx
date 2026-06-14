import { useEffect, useState } from "react";

function App() {
  const [socket, setSocket] = useState(null);

  const [connectionStatus, setConnectionStatus] =
    useState("Connecting...");

  const [peerId, setPeerId] = useState(
    localStorage.getItem("peerId") || ""
  );

  const [registered, setRegistered] =
    useState(false);

  const [targetPeer, setTargetPeer] =
    useState("");

  const [message, setMessage] = useState("");

  const [received, setReceived] = useState([]);

  useEffect(() => {
    let ws;

    const connectWebSocket = () => {
      setConnectionStatus("Connecting...");

      ws = new WebSocket(
        "wss://routing-backend-5dmc.onrender.com"
      );

      ws.onopen = () => {
        console.log("Connected");

        setConnectionStatus("Connected");

        setSocket(ws);

        // Auto-register if peerId exists
        if (peerId) {
          ws.send(
            JSON.stringify({
              type: "register",
              peerId,
            })
          );

          setRegistered(true);
        }
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        console.log("Received:", data);

        if (data.error) {
          alert(data.error);
          return;
        }

        if (data.payload) {
          setReceived((prev) => [
            ...prev,
            `${data.from}: ${data.payload}`,
          ]);
        }
      };

      ws.onerror = (error) => {
        console.error(error);

        setConnectionStatus(
          "Connection Error"
        );
      };

      ws.onclose = () => {
        console.log("Disconnected");

        setConnectionStatus(
          "Disconnected"
        );

        setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const registerPeer = () => {
    if (
      !socket ||
      socket.readyState !== WebSocket.OPEN
    ) {
      alert(
        "Not connected to server"
      );
      return;
    }

    if (!peerId.trim()) {
      alert("Enter Peer ID");
      return;
    }

    socket.send(
      JSON.stringify({
        type: "register",
        peerId,
      })
    );

    localStorage.setItem(
      "peerId",
      peerId
    );

    setRegistered(true);
  };

  const sendMessage = () => {
    if (
      !socket ||
      socket.readyState !== WebSocket.OPEN
    ) {
      alert(
        "Not connected to server"
      );
      return;
    }

    if (!registered) {
      alert("Register first");
      return;
    }

    if (!targetPeer.trim()) {
      alert("Enter target peer");
      return;
    }

    if (!message.trim()) {
      alert("Enter message");
      return;
    }

    socket.send(
      JSON.stringify({
        type: "relay",
        from: peerId,
        to: targetPeer,
        payload: message,
      })
    );

    setMessage("");
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "600px",
        margin: "auto",
      }}
    >
      <h1>
        Distributed Routing Server
      </h1>

      <p
        style={{
          fontWeight: "bold",
          fontSize: "18px",
          color:
            connectionStatus ===
            "Connected"
              ? "green"
              : connectionStatus ===
                "Connecting..."
              ? "orange"
              : "red",
        }}
      >
        Status: {connectionStatus}
      </p>

      <hr />

      <h3>Choose Your Peer ID</h3>

      <input
        type="text"
        placeholder="Enter Peer ID"
        value={peerId}
        onChange={(e) =>
          setPeerId(e.target.value)
        }
      />

      <button
        onClick={registerPeer}
        style={{
          marginLeft: "10px",
        }}
      >
        Register
      </button>

      <p>
        Registration:
        {registered
          ? " ✅ Registered"
          : " ❌ Not Registered"}
      </p>

      <hr />

      <h3>Send Message</h3>

      <input
        type="text"
        placeholder="Target Peer ID"
        value={targetPeer}
        onChange={(e) =>
          setTargetPeer(
            e.target.value
          )
        }
      />

      <br />
      <br />

      <input
        type="text"
        placeholder="Enter Message"
        value={message}
        onChange={(e) =>
          setMessage(
            e.target.value
          )
        }
      />

      <button
        onClick={sendMessage}
        style={{
          marginLeft: "10px",
        }}
      >
        Send
      </button>

      <hr />

      <h3>
        Received Messages
      </h3>

      {received.length === 0 ? (
        <p>No messages yet</p>
      ) : (
        received.map(
          (msg, index) => (
            <div
              key={index}
              style={{
                border:
                  "1px solid #ccc",
                padding: "8px",
                marginBottom:
                  "5px",
              }}
            >
              {msg}
            </div>
          )
        )
      )}
    </div>
  );
}

export default App;