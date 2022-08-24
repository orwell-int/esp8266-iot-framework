#ifndef CONFIG_H
#define CONFIG_H

struct configData
{
	char projectName[32];
	uint8_t light;
	uint8_t cBeforeNight[3];
	uint8_t cNight[3];
	uint8_t cAfterNight[3];
	uint8_t cNotConnected[3];
	uint8_t cConnected[3];
	uint8_t cError[3];
	uint8_t before;
	uint8_t after;
	uint8_t beginH;
	uint8_t beginM;
	uint8_t endH;
	uint8_t endM;
	bool d0;
	int8_t beginH0;
	int8_t beginM0;
	int8_t endH0;
	int8_t endM0;
	bool d1;
	int8_t beginH1;
	int8_t beginM1;
	int8_t endH1;
	int8_t endM1;
	bool d2;
	int8_t beginH2;
	int8_t beginM2;
	int8_t endH2;
	int8_t endM2;
	bool d3;
	int8_t beginH3;
	int8_t beginM3;
	int8_t endH3;
	int8_t endM3;
	bool d4;
	int8_t beginH4;
	int8_t beginM4;
	int8_t endH4;
	int8_t endM4;
	bool d5;
	int8_t beginH5;
	int8_t beginM5;
	int8_t endH5;
	int8_t endM5;
	bool d6;
	int8_t beginH6;
	int8_t beginM6;
	int8_t endH6;
	int8_t endM6;
};

extern uint32_t configVersion;
extern const configData defaults;

#endif