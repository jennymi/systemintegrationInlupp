/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package Server;
import Models.Message;
import com.google.gson.Gson;
import org.eclipse.paho.client.mqttv3.*;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;

import java.io.IOException;
import java.util.Set;
import javax.websocket.EncodeException;
/**
 *
 * @author gusta
 */
public class MqttListener implements MqttCallback{
    private final int qos = 1;
    private String topic = "test";
    private MqttClient client;
    private String clientId;
    private Message message;
    Set<DeviceEndpoint> ClientEndpoints;
    SQLDao db;
    public MqttListener(String adress, String port, String username, String password, Set<DeviceEndpoint> ClientEndpoints) {
        String host;
        db = new SQLDao();
        host = "tcp://" + adress + ":" + port;
        this.clientId = "";
        MqttConnectOptions conOpt = new MqttConnectOptions();
        conOpt.setCleanSession(true);
        conOpt.setUserName(username);
        conOpt.setPassword(password.toCharArray());
        try{
        this.ClientEndpoints = ClientEndpoints;
        this.client = new MqttClient(host, clientId, new MemoryPersistence());
        this.client.setCallback(this);
        this.client.connect(conOpt);
        this.message = null;
        this.client.subscribe(this.topic, qos);
        }catch(Exception e){
            e.printStackTrace();
        }
       
    }

    public void addEndpoint(DeviceEndpoint enp){
        ClientEndpoints.add(enp);
    }
    public void removeEndpoint(DeviceEndpoint enp){
        ClientEndpoints.remove(enp);
    }
    public void broadcast(Message message) 
            throws IOException, EncodeException 
    {
        ClientEndpoints.forEach(endpoint -> {
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
    public void sendMessage(String payload) throws MqttException {
        MqttMessage message = new MqttMessage(payload.getBytes());
        message.setQos(qos);
        this.client.publish(this.topic, message); // Blocking publish
    }

    /**
     * @see MqttCallback#connectionLost(Throwable)
     */
    public void connectionLost(Throwable cause) {
        System.out.println("Connection lost because: " + cause);
        System.exit(1);
    }

    /**
     * @see MqttCallback#deliveryComplete(IMqttDeliveryToken)
     */
    public void deliveryComplete(IMqttDeliveryToken token) {
    }

    /**
     * @see MqttCallback#messageArrived(String, MqttMessage)
     */
    @Override
    public void messageArrived(String topic, MqttMessage message) throws MqttException, IOException, EncodeException {
        System.out.println(String.format("[%s] %s", topic, new String(message.getPayload())));
        
        String jsonstring = new String(message.getPayload());
        Gson gson = new Gson();
        Message tempdata = gson.fromJson(jsonstring, Message.class);
        System.out.println(tempdata.getDevice());
        broadcast(tempdata);
        String query = "INSERT INTO DHT11sensor (temperature, humidity, deviceid) VALUES ('"+tempdata.getTemperature()+"', '"+tempdata.getHumidity()+"', '"+tempdata.getDevice()+"');";
        //Float res = (float) db.executeSQLUpdate(query);
        //System.out.println("sql result: " + res);
    }
    public void setMsgNull(){
        this.message = null;
    }
    
    public boolean checkMsg(){
        if(this.message != null){
            return true;
        }else{
            return false;
        }
    }
}
