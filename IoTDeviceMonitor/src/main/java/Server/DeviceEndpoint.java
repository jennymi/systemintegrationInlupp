/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package Server;

/**
 *
 * @author gusta
 */
import Models.Message;
import Util.MessageDecoder;
import Util.MessageEncoder;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

import javax.websocket.EncodeException;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;

@ServerEndpoint(value = "/device", decoders = MessageDecoder.class, encoders = MessageEncoder.class)
public class DeviceEndpoint {
    private Session session;
    private static final Set<DeviceEndpoint> endpoints = new CopyOnWriteArraySet<>();
    private static List<String> users = new ArrayList<>();
    @OnOpen
    public void onOpen(Session session) 
            throws IOException, EncodeException {
        this.session = session;
        endpoints.add(this);
        users.add(session.getId());

        Message message = new Message();
        message.setTemperature("20");
        broadcast(message);
    }

    @OnMessage
    public void onMessage(Session session, Message message) throws IOException, EncodeException {
        if (endpoints.contains(this)){
           // message.setFrom(users.get(session.getId()));
            broadcast(message);
        }
    }
    
    @OnClose
    public void onClose(Session session) throws IOException, EncodeException {
        endpoints.remove(this);
    }

    @OnError
    public void onError(Session session, Throwable throwable) {
        // Do error handling here
    }

    private static void broadcast(Message message) 
            throws IOException, EncodeException {
        endpoints.forEach(endpoint -> {
            synchronized (endpoint) {
                try {
                    endpoint.session.getBasicRemote()
                        .sendObject(message);
                } catch (IOException | EncodeException e) {
                    e.printStackTrace();
                }
            }
        });
    }
}
