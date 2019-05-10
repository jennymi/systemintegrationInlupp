#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include "DHT.h"
#include <ArduinoJson.h>

#define DHTPIN 12
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

String jsonAppendString;
char * charPointer;

unsigned long currentMillis = 0;
unsigned long prevMillis = 0;

const char * ssid = "IoT";
const char * password = "IoT2018!";
const char * mqttServer = "postman.cloudmqtt.com";
const int mqttPort = 18986;
const char * mqttUser = "wbxcsrlx";
const char * mqttPassword = "1gbNtqwbGAbj";
const char * mqtt_topic = "test";

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
 
  Serial.begin(115200);
  dht.begin();
 
  WiFi.begin(ssid, password);
 
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting to WiFi..");
  }
  Serial.println("Connected to the WiFi network");
 
  client.setServer(mqttServer, mqttPort);
  client.setCallback(callback);
 
  while (!client.connected()) {
    Serial.println("Connecting to MQTT...");
 
    if (client.connect("ESP8266Client", mqttUser, mqttPassword )) {
 
      Serial.println("connected");  
 
    } else {
 
      Serial.print("failed with state ");
      Serial.print(client.state());
      delay(2000);
 
    }
  }
 
  client.subscribe(mqtt_topic);
}

void SendTemp(){
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();
    int deviceid = 666;

    //DynamicJsonBuffer jsonBuffer; //lagras på heap
    StaticJsonBuffer<256> jsonBuffer; //lagras på stack, mindre minne och utrymme, mindre kod
    JsonObject & jsonObject = jsonBuffer.createObject();
    
    if (std::isnan(temperature)) {
      jsonObject["temperature"] = NULL;}
    else {
      jsonObject["temperature"] = temperature;}

    if (std::isnan(humidity)) {
      jsonObject["humidity"] = NULL;}
    else {
      jsonObject["humidity"] = humidity;}

    jsonObject["deviceid"] = deviceid;

    jsonAppendString = "";
    jsonObject.printTo(jsonAppendString); //destinationen för JSON-objektet
    charPointer = & jsonAppendString[0u]; //char-ptr, pekar nu på min JsonAppenString, [0u] handlar om bits, uint type 32 bit unsigned
    
    client.publish(mqtt_topic, charPointer); //constructorn tar bara char pekare/array https://pubsubclient.knolleary.net/api.html#publish1
    //(char*) jsonAppendString.c_str()
}

 
void callback(char* topic, byte* payload, unsigned int length) {
 
  Serial.print("Message arrived in topic: ");
  Serial.println(topic);
 
  Serial.print("Message:");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
 
  Serial.println();
  Serial.println("-----------------------");
 
}
 
void loop() {
    
    currentMillis = millis();
    client.loop();
    
    if (currentMillis - prevMillis >= 10000) {
      SendTemp();
      //client.publish(mqtt_topic, "Hello from ESP8266");
      Serial.println("Uppdaterat värden och skickat, 10 sec har gått");
      prevMillis = currentMillis;
   }
}
