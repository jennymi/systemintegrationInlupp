/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package Server;
import Models.Message;
import com.sun.rowset.CachedRowSetImpl;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.PreparedStatement;
import java.util.Date;
/**
 *
 * @author gusta
 */
public class SQLDao {
    
    public Message getDBList(){
        Message msg = new Message();
        msg.initList();
        ResultSet rs = null;
        msg.setDevice("list");
        String query = "SELECT DHT11sensor.id, DHT11sensor.temperature, DHT11sensor.humidity, DHT11sensor.created, Devices.devicename FROM sysint.DHT11sensor\n" +
        "inner join Devices on Devices.id = DHT11sensor.deviceid \n" +
        "order by DHT11sensor.created DESC LIMIT 10;";
        try{
        Class.forName("com.mysql.cj.jdbc.Driver");
        }catch(ClassNotFoundException e){
            e.printStackTrace();
        }
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://sysintinstance.c3ftwz9lwjxd.us-east-1.rds.amazonaws.com:3306/sysint?serverTimezone=UTC&useSSL=false",
               "gustafeden",
                "SecurePassword!");
                PreparedStatement stmt = con.prepareStatement(query);) {
            rs = stmt.executeQuery();
            if (!rs.next()) {
                msg.setTemperature("null");
            }else{
                do {
                    Message data = new Message();
                    data.setId(rs.getString("id"));
                    data.setDevice(rs.getString("devicename"));
                    data.setTemperature(rs.getString("temperature"));
                    data.setHumidity(rs.getString("humidity"));
                    data.setCreated(rs.getString("created"));
                    
                    msg.addToList(data);
                    System.out.println("Id: "+ data.getId()+ ". Temp: " +data.getTemperature()+ ". Hum: " +data.getHumidity()+ ". Created: " +data.getCreated());
                } while (rs.next());
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return msg;
    }

    public int executeSQLUpdate(String query) {
        int result = 0;
         try{
        Class.forName("com.mysql.cj.jdbc.Driver");
        }catch(ClassNotFoundException e){
            e.printStackTrace();
        }
        System.out.println("executing sql update");
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://sysintinstance.c3ftwz9lwjxd.us-east-1.rds.amazonaws.com:3306/sysint?serverTimezone=UTC&useSSL=false",
               "gustafeden",
                "SecurePassword!");
                PreparedStatement stmt = con.prepareStatement(query);) {
            result = stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return result;
    }
}
