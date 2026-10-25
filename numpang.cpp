const int POT = 6;

void setup() {
  Serial.begin(115200);
}

void loop() {
  int nilai = analogRead(POT);

  Serial.println(nilai);

  delay(200);
}
