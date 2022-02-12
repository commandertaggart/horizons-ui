
const HydraClientProtocol = {
    port: 1865,
    encode(message) {
        return JSON.stringify({
            Cmd: message.messageType,
            Value: message.messagePayload
        });
    },
    decode(message) {
        
        try {
            const decoded = JSON.parse(message);
            return {
                messageType: decoded.Cmd,
                messagePayload: decoded.Value
            }
        } catch (_ex) {
            console.error('Failed to decode incoming message:', message);
        }
    },
    send(socket, messageType, messagePayload) {
        let message = { messageType, messagePayload };
        if (typeof(messageType) === 'object' && 'messageType' in messageType) {
            message = messageType;
        }

        if (socket) {
            socket.send(this.encode(message));
        }
    }
};

export default HydraClientProtocol;