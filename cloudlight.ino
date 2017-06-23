#include <FastLED.h>
#define NUM_LEDS 70
#define DATA_PIN 6
#define totalLights 15

int activeLights = 0;
int lightMap[totalLights];
int colorMap[totalLights];
int directionalMap[totalLights];
int brightMap[totalLights];
int colors[3][3] = {{255,255,0},{255,0,200},{195,0,255}};
CRGB leds[NUM_LEDS];

void setup() {
  // put your setup code here, to run once:
   FastLED.addLeds<WS2812, DATA_PIN, BRG>(leds, NUM_LEDS);
   for (int i = 0; i < totalLights; i++) {
      lightMap[i] = -1; // initialize the lightMap
   }
}

void addLight() {
  // find first empty light
  int mapIndex = 0; // this shouldn't stay 0, but just in case
  for (int i = 0; i < totalLights; i++) {
    if (lightMap[i] == -1) { mapIndex = i; }
  }
  lightMap[mapIndex] = random(NUM_LEDS); // assign a position
  colorMap[mapIndex] = random(sizeof(colors));
  directionalMap[mapIndex] = 1; // set to go brighter
  brightMap[mapIndex] = 10;
  activeLights++;
}

void removeLight(int mapIndex) {
  lightMap[mapIndex] = -1;
  colorMap[mapIndex] = 0;
  directionalMap[mapIndex] = 0;
  brightMap[mapIndex] = 0;
  activeLights--;
}

void calculateColor(int result[], int colorIndex, int brightness) {
  int color[] = { colors[colorIndex][0], colors[colorIndex][1], colors[colorIndex][2]};
  result[0] = color[0] * brightness / 100;
  result[1] = color[1] * brightness / 100;
  result[2] = color[2] * brightness / 100;
}

void runLights() {
  if (activeLights < totalLights) {
    addLight();
  }
  for (int i = 0; i < totalLights; i++) {
    if (lightMap[i] > -1) {
      int mapIndex = lightMap[i];
      int colorAdj[3];
      calculateColor(colorAdj, colorMap[mapIndex], brightMap[mapIndex]);
      leds[mapIndex].setRGB(colorAdj[0], colorAdj[1], colorAdj[2]);
      if (brightMap[mapIndex] + (10 * directionalMap[mapIndex]) >= 100) {
        directionalMap[mapIndex] = -1;
      }
      brightMap[mapIndex] += (10 * directionalMap[mapIndex]);
      if (brightMap[mapIndex] <= 0) {
        removeLight(mapIndex);
      }
    }
  }
}


void loop() {
  // put your main code here, to run repeatedly:
  FastLED.clear();
  runLights();
  FastLED.show();
  delay(30);
}
