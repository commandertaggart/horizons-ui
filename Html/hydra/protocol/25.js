
const HydraClientProtocol = {
    port: 1865,
    encode(message) {
        let payload = message.messagePayload;
        if (typeof(payload) === 'object') {
            payload = JSON.stringify(payload);
        }
        else if (typeof(payload) === 'undefined') {
            payload = '';
        }
        return message.messageType + '|' + message.messagePayload;
    },
    decode(message) {
        message = message.split('|');
        
        try {
            message[1] = JSON.parse(message[1]);
        } catch (_ex) {}

        return {
            messageType: message[0],
            messagePayload: message[1]
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