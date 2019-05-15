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
import java.util.Objects;
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
    public Session session;
    private static final Set<DeviceEndpoint> clientEndpoints = new CopyOnWriteArraySet<>();
    private static MqttListener mqtt = new MqttListener("m24.cloudmqtt.com", "12530", "ofqhaueq", "c6lwyXwW_8AQ", clientEndpoints);
    private static SQLDao db = new SQLDao();
    @OnOpen
    public void onOpen(Session session) 
            throws IOException, EncodeException {
        this.session = session;
        clientEndpoints.add(this);
        mqtt.addEndpoint(this);
      //  users.add(session.getId());

       // Message message = new Message();
       // message.setTemperature("20");
       // broadcast(message);
    }

    @OnMessage
    public void onMessage(Session session, Message message) throws IOException, EncodeException {
        if (clientEndpoints.contains(this)){
           // message.setFrom(users.get(session.getId()));
            System.out.println("message arrived from websocket: " + message.getDevice());
            if (Objects.equals(message.getDevice(), "list")) {
               // System.out.println("list equals");
            Message ret = db.getDBList();
                System.out.println("sending message: " + ret.getDevice());
           
                //broadcast(ret);
                session.getBasicRemote().sendObject(ret);
            }
            //broadcast(message);
        }
    }
    
    @OnClose
    public void onClose(Session session) throws IOException, EncodeException {
        clientEndpoints.remove(this);
        mqtt.removeEndpoint(this);
    }

    @OnError
    public void onError(Session session, Throwable throwable) {
        // Do error handling here
    }

    private static void broadcast(Message message) 
            throws IOException, EncodeException {
        clientEndpoints.forEach(endpoint -> {
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