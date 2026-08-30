/*！
 * @file pxt-motor/main.ts
 * @brief DFRobot's microbit motor drive makecode library.
 * @n [Get the module here](http://www.dfrobot.com.cn/goods-1577.html)
 * @n This is the microbit special motor drive library, which realizes control 
 *    of the eight-channel steering gear, two-step motor and four-way dc motor.
 *
 * @copyright	[DFRobot](http://www.dfrobot.com), 2016
 * @copyright	GNU Lesser General Public License
 *
 * @author [email](1035868977@qq.com)
 * @version  V1.0.1
 * @date  2018-03-20
 *
 * Slow Decay & 500Hz
 * date  2026-08-30
 */

/**
 *This is DFRobot:motor user motor and steering control function.
 */
//% weight=10 color=#DF6721 icon="\uf013" block="DF-Driver S"
namespace motor {
    const PCA9685_ADDRESS = 0x40
    const MODE1 = 0x00
    const MODE2 = 0x01
    const SUBADR1 = 0x02
    const SUBADR2 = 0x03
    const SUBADR3 = 0x04
    const PRESCALE = 0xFE
    const LED0_ON_L = 0x06
    const LED0_ON_H = 0x07
    const LED0_OFF_L = 0x08
    const LED0_OFF_H = 0x09
    const ALL_LED_ON_L = 0xFA
    const ALL_LED_ON_H = 0xFB
    const ALL_LED_OFF_L = 0xFC
    const ALL_LED_OFF_H = 0xFD

    const STP_CHA_L = 2047
    const STP_CHA_H = 4095

    const STP_CHB_L = 1
    const STP_CHB_H = 2047

    const STP_CHC_L = 1023
    const STP_CHC_H = 3071

    const STP_CHD_L = 3071
    const STP_CHD_H = 1023


    const BYG_CHA_L = 3071
    const BYG_CHA_H = 1023

    const BYG_CHB_L = 1023
    const BYG_CHB_H = 3071

    const BYG_CHC_L = 4095
    const BYG_CHC_H = 2047

    const BYG_CHD_L = 2047
    const BYG_CHD_H = 4095

    /**
     * The user selects the 4-way dc motor.
     */
    export enum Motors {
        M1 = 0x1,
        M2 = 0x2,
        M3 = 0x3,
        M4 = 0x4,
		INI = 0x0
    }

    /**
     * The user defines the motor rotation direction.
     */
    export enum Dir {
        //% blockId="CW" block="CW"
        CW = 1,
        //% blockId="CCW" block="CCW"
        CCW = -1,
        //% blockId="NONE" block="NONE"
        NONE = 0,
    }


    let initialized = false

    function i2cWrite(addr: number, reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    function i2cCmd(addr: number, value: number) {
        let buf = pins.createBuffer(1)
        buf[0] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    function i2cRead(addr: number, reg: number) {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE);
        return val;
    }

    function initPCA9685(): void {
        i2cWrite(PCA9685_ADDRESS, MODE1, 0x00)
        //setFreq(50);
		//setFreq(100); //for test 100Hz
		//setFreq(500); //for test 500Hz
		setFreq(800); //for test 763Hz
		//setFreq(1000); //for test 1kHz
		
        initialized = true
    }

    function setFreq(freq: number): void {
        // Constrain the frequency
        let prescaleval = 25000000;
        prescaleval /= 4096;
        prescaleval /= freq;
        prescaleval -= 1;
        let prescale = prescaleval;//Math.floor(prescaleval + 0.5);
        let oldmode = i2cRead(PCA9685_ADDRESS, MODE1);
        let newmode = (oldmode & 0x7F) | 0x10; // sleep
        i2cWrite(PCA9685_ADDRESS, MODE1, newmode); // go to sleep
        i2cWrite(PCA9685_ADDRESS, PRESCALE, prescale); // set the prescaler
        i2cWrite(PCA9685_ADDRESS, MODE1, oldmode);
        control.waitMicros(5000);
        i2cWrite(PCA9685_ADDRESS, MODE1, oldmode | 0xa1);
    }

    function setPwm(channel: number, on: number, off: number): void {
        if (channel < 0 || channel > 15)
            return;

        let buf = pins.createBuffer(5);
        buf[0] = LED0_ON_L + 4 * channel;
        buf[1] = on & 0xff;
        buf[2] = (on >> 8) & 0xff;
        buf[3] = off & 0xff;
        buf[4] = (off >> 8) & 0xff;
        pins.i2cWriteBuffer(PCA9685_ADDRESS, buf);
    }
	
    /**
	 * Execute a motor
     * M1~M4.
     * speed(0~255).
    */
    //% weight=90
    //% blockId=motor_MotorRun block="Motor|%index|dir|%Dir|speed|%speed"
    //% speed.min=0 speed.max=255
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% direction.fieldEditor="gridpicker" direction.fieldOptions.columns=2
	export function MotorRun(index: Motors, direction: Dir, speed: number): void {
	    if (!initialized) {
	        initPCA9685()
	    }
	
	    if (index < 1 || index > 4) {
	        return
	    }
	
	    // Limit input to -255 ... +255
	    if (speed > 255) {
	        speed = 255
	    } else if (speed < -255) {
	        speed = -255
	    }
	
	    // NONE:
	    //   positive speed -> CW
	    //   negative speed -> CCW
	    //
	    // CW / CCW:
	    //   preserve original 0 ... 255 behavior
	    let actualDir = direction
	
	    if (direction == Dir.NONE) {
	        if (speed < 0) {
	            actualDir = Dir.CCW
	            speed = -speed
	        } else {
	            actualDir = Dir.CW
	        }
	    } else {
	        // CW / CCW do not accept negative speed
	        if (speed < 0) {
	            speed = 0
	        }
	    }
	
	    let pn = (4 - index) * 2
	    let pp = pn + 1
	
	    // Stop
	    if (speed == 0) {
	        setPwm(pp, 0, 4096)
	        setPwm(pn, 0, 4096)
	        return
	    }
	
	    // Map 0...255 exactly to 0...4095
	    let pwm = Math.round(speed * 4095 / 255)
	
	    // Slow Decay : Current Hold period
	    let holdPwm = 4096 - pwm
	
	    if (actualDir == Dir.CW) {
	        // H/H : Current Hold
	        // H/L : Drive
	        setPwm(pp, 4096, 0)
	        setPwm(pn, 0, holdPwm)
	    } else {
	        // H/H : Current Hold
	        // L/H : Drive
	        setPwm(pp, 0, holdPwm)
	        setPwm(pn, 4096, 0)
	    }
	}
/*

PCA9685 count
0                            3616       4095
|-----------------------------|------------|
|       3616 counts           | 480 counts|
|        88.3 %               |   11.7 %  |


pp  HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH
    ←────────── constantly H ──────────────→


pn  HHHHHHHHHHHHHHHHHHHHHHHHHHHHHLLLLLLLL
    ←── Slow Decay / Current Hold ─→← Drive →

                  H/H                 H/L
                   ↓                   ↓
             Slow Decay           Motor Drive
          Current recirculation


Motor Current

         Slow Decay       Drive   Slow Decay       Drive
       ←──────────────→←────→←──────────────→←────→

Imax   ●                    ●                    ●
        ＼                 ／ ＼                 ／
         ＼               ／   ＼               ／
          ＼             ／     ＼             ／
           ＼           ／       ＼           ／
            ＼_________●         ＼_________●
                     Imin                 Imin

      current decays ↑       current decays ↑
          slowly     │           slowly     │
                     │                      │
                 current rises          current rises

0A  ───────────────────────────────────────────────
  
*/
    /**
	 * Stop the dc motor.
    */
    //% weight=20
    //% blockId=motor_motorStop block="Motor stop|%index"
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2 
    export function motorStop(index: Motors) {
		if (!initialized) {
	        initPCA9685()
	    }
	    if (index < 1 || index > 4) {
	        return
	    }
        setPwm((4 - index) * 2, 0, 0);
        setPwm((4 - index) * 2 + 1, 0, 0);
    }

    /**
	 * Stop all motors
    */
    //% weight=10
    //% blockId=motor_motorStopAll block="Motor Stop All"
    export function motorStopAll(): void {
		if (!initialized) {
	        initPCA9685()
	    }
        for (let idx = 1; idx <= 4; idx++) {
            motorStop(idx);
        }
    }
}

