/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package Models;

import java.util.List;

/**
 *
 * @author gusta
 */
public class Message {

    private String temperature, humidity, created, id, device;
    private List<Message> table;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDevice() {
        return device;
    }

    public void setDevice(String device) {
        this.device = device;
    }

    public String getHumidity() {
        return humidity;
    }

    public void setHumidity(String humidity) {
        this.humidity = humidity;
    }

    public String getCreated() {
        return created;
    }

    public void setCreated(String created) {
        this.created = created;
    }

    public void addToList(Message msg) {
        table.add(msg);
    }

    public List<Message> getTable() {
        return table;
    }

    public void setTable(List<Message> table) {
        this.table = table;
    }

    @Override
    public String toString() {
        return super.toString();
    }

    public String getTemperature() {
        return temperature;
    }

    public void setTemperature(String temperature) {
        this.temperature = temperature;
    }

}
