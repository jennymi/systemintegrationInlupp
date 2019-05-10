/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package Server;
import com.sun.rowset.CachedRowSetImpl;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.PreparedStatement;
/**
 *
 * @author gusta
 */
public class SQLDao {
     public ResultSet executeSQLQuery(String query) {
        ResultSet rs = null;
        CachedRowSetImpl crs = null;
         try{
        Class.forName("com.mysql.cj.jdbc.Driver");
        }catch(ClassNotFoundException e){
            e.printStackTrace();
        }
        try (Connection con = DriverManager.getConnection(
                "sysintinstance.c3ftwz9lwjxd.us-east-1.rds.amazonaws.com",
               "gustafeden",
                "SecurePassword!");
                PreparedStatement stmt = con.prepareStatement(query);) {
            rs = stmt.executeQuery();
            crs = new CachedRowSetImpl();
            crs.populate(rs);
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return crs;
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
