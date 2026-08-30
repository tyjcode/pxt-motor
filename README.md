# DF-Driver

Micro:bit motor drive expansion board.
---------------------------------------------------------

## Table of Contents

* [URL](#url)
* [Summary](#summary)
* [Changes in This Fork](#Changes)
* [Blocks](#blocks)
* [License](#license)

## URL
project URL:  ```https://github.com/tyjcode/pxt-motor```  origin ```https://github.com/DFRobot/pxt-motor```

## Summary
Micro: bit motor driven expansion board is not only expanded the motor drive, in the integration of this extended board four motor driven, 2 road, on the basis of stepper motor driver, also raises the additional 8 road steering gear interface, IO port, 2 road 9 I2C interface.
The motor adopts the interface mode of large current, and the steering machine, I2C and IO port all use Gravity standard interface to support a large number of modules and sensors.
The expansion board USES 3.5v ~ 5.5v power supply, 3.5mm plug and wiring two power interface modes.It has the characteristics of wide range of voltage adaption, large number of ports, compact size, plug and play, convenience and so on.

## Changes in this Fork

This fork modifies the DC motor control for the DFRobot Micro:bit Driver Expansion Board.

### Changes

- Changed the HR8833 motor drive method from **Fast Decay** to **Slow Decay**.
- Tested higher PCA9685 PWM frequencies for smoother low-speed motor control.
- Servo motors are not intended to be used with this configuration.

### Test Results

Slow Decay significantly improved low-speed operation with geared DC motors.

Tested PWM frequencies:

- 50 Hz: Good low-speed torque, but noticeable jerky motion.
- 100 Hz: Improved low-speed stability.
- 500 Hz: Stable and smooth operation from low speed.
- 1000 Hz: Stable low-speed operation, but PWM noise was more noticeable.

For line-following robots, **500 Hz Slow Decay** is currently the recommended setting.

Example:

**typescript**
setFreq(500);


## Blocks

### 1.DC Motor
![image](https://github.com/tyjcode/pxt-motor/blob/master/image/7.png)

### 2.Stop the motor
![image](https://github.com/tyjcode/pxt-motor/blob/master/image/6.png)

### 3.Stop all motors
![image](https://github.com/tyjcode/pxt-motor/blob/master/image/4.png)


## License

GNU

## Supported targets

* for PXT/microbit
(The metadata above is needed for package search.)
```package
gamePad=github:DFRobot/pxt-motor
```
