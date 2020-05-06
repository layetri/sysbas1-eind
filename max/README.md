# MaxMSP: OSC routing en mapping

## `player/y`
### 1. BRIGHT
De inverse van player/y is gemapt naar de max-macro BRIGHT. Hoe lager de y-pos, hoe hoger BRIGHT. BRIGHT controleert:
1. De bightness van de video (meer BRIGHT = meer brightness).
2. Het contrast van de video (meer BRIGHT = minder contrast).
3. Helderheid "additive bells/pad" (meer BRIGHT = hoger plafond van de additieve ratio's).
4. De hoeveelheid fft bins die gevuld worden in de FFT CLOUDS PATCH (meer BRIGHT = meer bins).
5. De modus van de harmonyControl patch. (meer BRIGHT = blijere modus, va mixolydisch naar majeur naar lydisch).

## `player/angle`
### 1. pan
Angle wordt gescaled naar een waarde tussen 0 en 1 (180 graden wordt nul, 360 graden en 0 graden worden 1. Dit zorgt ervoor dat het er nooit een harde overgang van 0 naar 1 is ). Deze waarde gaat via een send/recieve paar naar de "pan" subpatcher van:
1. De reverb.
2. De Saw Pad.
3. De Sine to Saw Synth, hier is de panning omgekeerd.
### saturation
De angle stuurt ook de saturation aan van de video (hogere waarde van angle = meer saturation).
Verder 
### 2. sawTrig
Elk keer dat player/angle overeen komt met een veelvoud van 45 graden (dus 0, 45, 90, 135 etc.) wordt de sawTrig bang gestuurd naar de Sine to Saw Synth, dit triggerd de echoArp die noten genereert die vervolgens door de synth worden gespeeld.

## `player/speed`
### 1. SPEED
De player/speed wordt gedurende 1000 ms opgetelt en deze waarde wordt afgetrokken van de vorige waarde van deze som. Dit is dus het gemiddelde van player/speed gedurende 1 seconde afgetrokken van het vorige gemiddelde. Dit wordt gescaled naar een waarde tussen 0 en 127 en met het [slide]-object wordt deze output een beetje gesmoothed, deze output gaat bestuurt de SPEED macro:
1. De snelheid van de video (meer SPEED = sneller).
2. De snelheid van de FFT Clouds (meer SPEED = sneller).
3. De snelheid van de echoArp voor de sine to saw synth (meer SPEED = sneller).
4. De snelheid waarmee de randomGrain patch (binnen collision FX) de grains afspeelt (meer SPEED = sneller).
5. De grain grootte van de randomGrain patch (meer SPEED = kleiner)

## `/bouncing`
### 1. collision
Het send/receive-paar "collision" triggert de collsion FX:
1. "collisionPing", dit is een korte ping van een sinusoscillator met een pitch envelope die heel snel naar beneden sweept voor een snappy attack.
2. "randomGrain", dit is een patch continu de laatste tien seconden van alle audio (zonder reverb) opneemt in een buffer. Als de randomGrain patch getriggerd wordt, speelt deze patch voor een bepaalde tijdsduur een granulaire reflectie van het geluid in deze buffer af, alsof het geluid uit elkaar valt. 
3. De FFT Clouds patcher wordt actief
### 2. bounce
Dit gebeurt als de /bouncing parameter naar nul terugkeert (dus aan het einde van een bounce oftewel collision). Dit triggert de collisionPing maar dan twee octave hoger.

## `/night`
### 1. cyber
Cyber triggert een aantal dingen:
1. Volume van de "big sawpad"  (het volume komt omhoog, was eerst onhoorbaar). Dit zit binnen de [poly~ sawPad].
2. De modus die gebruikt wordt door harmonyControl shift naar frygisch.
3. De attack van de additive bells patch gaat naar 2000 ms, waardoor het een soort pad wordt.
4. De Q van de sine to saw synth gaat langzaam naar nul, waardoor het geluid van een sinus naar een zaagtand transformeert.
5. De sine to saw synth wordt een octaaf lager.
6. De video vocoder wordt een octaaf hoger.
7. De instability-paramter van de "fm drone" gaat langzaam omhoog, waardoor de drone instabilier wordt.
8. De detune van de sawpad wordt ook langzaam steeds hoger, waardoor het steeds meer een soort noise laag wordt.

## `/clock`
### 1. clock
De clock van javascript wordt gesyncd met de clock van Max, deze wordt gebruikt om aan het einde de eindsequentie te triggeren.

## `/plane/added`
1. Dit triggert een noot bij de additive bells synthesizer.

## `/plane/removed`
#### 1. harmonyTrigger
Deze trigger bedient:
1. De harmonyControl patch genereert een nieuwe harmonie.
2. De additiveControl patch genereert nieuwe parameters voor de additieve bells synth.
3. De longDelay subpatcher van de sawpad genereert nieuwe delaytijden.



