NUM_UPDATE = 25;
FPS_PHYSICS_CHECK = 60;

CIRCLE_SPEED = 5;
TRIANGLE_SPEED = 5;
SQUARE_SPEED = 5;

CIRCLE_SIZE = 15;
TRIANGLE_SIZE = 15;
SQUARE_SIZE = 15;

CIRCLE_TYPE =  0;
TRIANGLE_TYPE = 1;
SQUARE_TYPE = 2;

CIRCLE_BULLET_SPEED = 1440;
TRIANGLE_BULLET_SPEED = 1440;
SQUARE_BULLET_SPEED  = 1440;

// Triangle offset
OFFTRIANGLE_P1 = Math.PI * 2 / 3;
OFFTRIANGLE_P2 = Math.PI * 4 / 3;

// Square offset
OFFSQUARE_P0 = Math.PI * 7 / 4;
OFFSQUARE_P1 = Math.PI * 1 / 4;
OFFSQUARE_P2 = Math.PI * 3 / 4;
OFFSQUARE_P3 = Math.PI * 5 / 4;

// Hex-based obstacles
NUM_HEX_WIDTH = 48;
NUM_HEX_HEIGHT = 48;
HEX_DENSITY = 3/10;
HEX_SCALE = 1/3;

// The world
TILE_WIDTH = 274 * HEX_SCALE;
TILE_HEIGHT = 472 * HEX_SCALE;
HEX_WIDTH = 275 * HEX_SCALE;
HEX_HEIGHT = 317 * HEX_SCALE;
WORLD_WIDTH = TILE_WIDTH * NUM_HEX_WIDTH;
WORLD_HEIGHT = TILE_HEIGHT / 2 * NUM_HEX_HEIGHT;

// Friction of the world
FRICTION = 0.97;

// Snapshot
MAX_WORLD_SNAPSHOT = 20;

// Graphics
BACKGROUND_TEXTURE = 'Texture.png';
HEX_BASE = 'HexBase.png';
COLORS = [0xFA6747, 0xE33935, 0xFD479F, 0xFD9C3B, 0xE37035, 0x5899FD, 0x4556E3, 0x7658FA, 0x9145E3, 0xD74CFD, 0x61FC54, 0x3ED964, 0x50F0A9, 0x48FCE4, 0x3DBDD6, 0xFCCD49, 0xF0B451, 0xD9893E, 0xFC8B54];