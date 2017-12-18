// This #include statement was automatically added by the Particle IDE.
#include <Adafruit_SSD1306.h>

Servo servo; //declare servo
#define OLED_DC     D5
#define OLED_CS     D2
#define OLED_RESET  D0
Adafruit_SSD1306 display(OLED_DC, OLED_RESET, OLED_CS); //declare OLED


#define NOTE_D6  1175
#define NOTE_E6  1319
#define NOTE_F6  1397
#define NOTE_G6  1568
#define NOTE_A6  1760
#define NOTE_AS6 1865
#define NOTE_G7  3136
#define NOTE_B6  1976
#define NOTE_A7  3520
#define NOTE_C7  2093
#define NOTE_D7  2349
#define NOTE_E7  2637
#define NOTE_F7  2794

//Mario main theme melody
int melody[] = {
  NOTE_E7, NOTE_E7, 0, NOTE_E7,
  0, NOTE_C7, NOTE_E7, 0,
  NOTE_G7, 0, 0,  0,
  NOTE_G6, 0, 0, 0,

  NOTE_C7, 0, 0, NOTE_G6,
  0, 0, NOTE_E6, 0,
  0, NOTE_A6, 0, NOTE_B6,
  0, NOTE_AS6, NOTE_A6, 0,

  NOTE_G6, NOTE_E7, NOTE_G7,
  NOTE_A7, 0, NOTE_F7, NOTE_G7,
  0, NOTE_E7, 0, NOTE_C7,
  NOTE_D7, NOTE_B6, 0, 0,

  NOTE_C7, 0, 0, NOTE_G6,
  0, 0, NOTE_E6, 0,
  0, NOTE_A6, 0, NOTE_B6,
  0, NOTE_AS6, NOTE_A6, 0,

  NOTE_G6, NOTE_E7, NOTE_G7,
  NOTE_A7, 0, NOTE_F7, NOTE_G7,
  0, NOTE_E7, 0, NOTE_C7,
  NOTE_D7, NOTE_B6, 0, 0
};
//Mario main them tempo
int tempo[] = {
  12, 12, 12, 12,
  12, 12, 12, 12,
  12, 12, 12, 12,
  12, 12, 12, 12,

  12, 12, 12, 12,
  12, 12, 12, 12,
  12, 12, 12, 12,
  12, 12, 12, 12,

  9, 9, 9,
  12, 12, 12, 12,
  12, 12, 12, 12,
  12, 12, 12, 12,

  12, 12, 12, 12,
  12, 12, 12, 12,
  12, 12, 12, 12,
  12, 12, 12, 12,

  9, 9, 9,
  12, 12, 12, 12,
  12, 12, 12, 12,
  12, 12, 12, 12,
};





int pos=90;  //initial servo position
int servoPin=D1; // choose the input pin (for servo)
int buzzerPin=D3; // choose the input pin (for buzzer)
int motionPin =A0;  // choose the input pin (for PIR sensor)
int pirState = LOW; // we start, assuming no motion detected
int val = 0; // variable for reading the pin status
bool locked=false; // if door should be locked
const int ledPin =  D4; //set LED pin
int ledState = LOW; //initial LED state
unsigned long previousMillis = 0; // LED blink delta timing
unsigned long interval = 1000; // LED blink interval
String state="open"; // initial state
int controlButtonPin=D6; // set up control button pin
int buzzer_interval=1000; // set buzzer interval, initial=1s 
const int MIN_BUTTON_PRESS_TIME=100; // debounce button
int lastButtonPressTime=0; // debounce button
bool released=true; // if the last mouse has been released

void setup() {
    Serial.begin(9600);
    Particle.function("opendoor",openDoor); // cloud function to open the trap
    Particle.function("lock",lock); // lock the door
    Particle.function("unlock",unlock); // unlock the door
    Particle.function("setBuzzer",setBuzzer); //set buzzer time
    Particle.variable("status",state); //get trap state
    pinMode(motionPin, INPUT);  // declare motion sensor as input
    pinMode(ledPin, OUTPUT);  // declare sensor as input
    pinMode(controlButtonPin, INPUT_PULLUP); // declare button as input
    servo.attach(servoPin); // attach servo to pin
    servo.write(pos); // initial setup
    display.begin(SSD1306_SWITCHCAPVCC); // set up OLED
    display.setTextSize(3); // text size
    display.setTextColor(WHITE); // text color
    display.setTextWrap(false); 
    display.clearDisplay();
    display.setCursor(0, 7);
    display.print("Empty");
    display.display();
    
}
 
void loop(){
    val =digitalRead(motionPin);  // read input value
    if (val == 1&&!locked) { // check if the input is HIGH
        //if motion detected, close trap
        trapDoorClosing("3");
        Particle.publish("motionDetected", "unlocked");
    }
    if(servo.read()>=175){
        released=false;
        if(isButtonPressed("s")==0&&!locked){
            openDoor("s");
        }
        // LED blink after trapping the mouse
        unsigned long currentMillis = millis();
        if (currentMillis - previousMillis > interval) {
            previousMillis = currentMillis;
            if (ledState == LOW)
              ledState = HIGH;
            else
              ledState = LOW;
            digitalWrite(ledPin, ledState);
        }
    }
    long now=millis();
    while(true){
        if (millis()-now> 200){
            break;
        }
    } 
}
int trapDoorClosing(String input){
    //if last motion was releasing the last mouse
    //that means new mouse has been trapped
    //update state
    //buzz for a while
    if(released){//close trap
        servo.write(180);
        //show mouse has been trapped
        display.setTextSize(3);    
        display.clearDisplay();
        display.setCursor(0, 7);
        display.print("Trapped");
        display.display();
        state="closed";
        Particle.publish("Update",state);
        //let buzzer buzz for a period of time
        sing();
    }
    return 1;
}
// return if the button has been pressed
int isButtonPressed(String i) {
    long now = millis();
    if( (digitalRead(controlButtonPin) == 0) && (now-lastButtonPressTime > MIN_BUTTON_PRESS_TIME) ) {
        lastButtonPressTime = now;
        return 0;
    }
    return 1;
}
//open the trap door
//show trap empty on OLED
int openDoor(String s){
    servo.write(90);
    digitalWrite(ledPin, LOW);
    display.setTextSize(3);    
    display.clearDisplay();
    display.setCursor(0, 7);
    display.print("Empty");
    display.display();
    state="open";
    released=true;
    Particle.publish("Update",state);
    val=0;
    return 1;
}
//disable button to lock the door
int lock(String s){
    locked=true;
    return 1;
}
//unlock the door
int unlock(String s){
    locked=false;
    return 1;
}
//set buzzer time
int setBuzzer(String interval){
    buzzer_interval=interval.toInt()*1000;
    Particle.publish("buzz",interval);
    return buzzer_interval;
}


void sing(){
    long buzzerStartTime=millis();
    int size = sizeof(melody) / sizeof(int);
    int thisNote = 0; 
    //customized buzz time 
    while (thisNote < size&&millis()-buzzerStartTime<buzzer_interval) {
      // to calculate the note duration, take one second
      // divided by the note type.
      int noteDuration = 1000 / tempo[thisNote];
      tone(buzzerPin, melody[thisNote], noteDuration);
      // to distinguish the notes, set a minimum time between them.
      // the note's duration + 30% seems to work well:
      delay(noteDuration*1.3);
      thisNote++;
    }
}
