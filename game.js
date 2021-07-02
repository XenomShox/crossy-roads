var config = {
    type: Phaser.AUTO,
    //width: window.innerWidth,
    //height: window.innerHeight,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            //debug: true,
        },
    },
    scene: {
        preload,
        create,
        update,
    },
    scale: {
        width: 516.4,
        height: 16 * 15,
        zoom: 2.5,
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
};

var game = new Phaser.Game(config);

function preload() {
    this.load.image("tiles", "assets/tileset/city_tiles.png");
    this.load.tilemapTiledJSON("city", "assets/maps/city_1.json");

    this.load.spritesheet("player", "assets/characters/kavi.png", {
        frameWidth: 32,
        frameHeight: 48,
    });

    this.load.atlas(
        "kevin",
        "assets/characters/kevin/kevin.png",
        "assets/characters/kevin/kevin.json"
    );
    this.kevin = undefined;
    this.cursors = undefined;
}

function create() {
    const map = this.make.tilemap({ key: "city" });
    const tileset = map.addTilesetImage("city", "tiles");

    map.createLayer("ground", tileset);
    const Objects = map.createLayer("Obstacles", tileset);

    Objects.setCollisionByProperty({ collides: true });

    //debugDraw(Objects, this);

    this.kevin = this.physics.add.sprite(20, 20, "kevin", "down-idle-0.png");
    this.kevin.body.setSize(16, 8);
    this.kevin.body.offset.y = 40;

    this.anims.create({
        key: "kevin-idle-down",
        frames: this.anims.generateFrameNames("kevin", {
            start: 0,
            end: 4,
            prefix: "down-idle-",
            suffix: ".png",
        }),
        repeat: -1,
        frameRate: 15,
    });
    this.anims.create({
        key: "kevin-idle-up",
        frames: this.anims.generateFrameNames("kevin", {
            start: 0,
            end: 4,
            prefix: "up-idle-",
            suffix: ".png",
        }),
        repeat: -1,
        frameRate: 15,
    });
    this.anims.create({
        key: "kevin-idle-side",
        frames: this.anims.generateFrameNames("kevin", {
            start: 0,
            end: 4,
            prefix: "side-idle-",
            suffix: ".png",
        }),
        repeat: -1,
        frameRate: 15,
    });

    this.anims.create({
        key: "kevin-walk-down",
        frames: this.anims.generateFrameNames("kevin", {
            start: 0,
            end: 5,
            prefix: "down-walk-",
            suffix: ".png",
        }),
        repeat: -1,
        frameRate: 8,
    });
    this.anims.create({
        key: "kevin-walk-up",
        frames: this.anims.generateFrameNames("kevin", {
            start: 0,
            end: 5,
            prefix: "up-walk-",
            suffix: ".png",
        }),
        repeat: -1,
        frameRate: 8,
    });
    this.anims.create({
        key: "kevin-walk-side",
        frames: this.anims.generateFrameNames("kevin", {
            start: 0,
            end: 5,
            prefix: "side-walk-",
            suffix: ".png",
        }),
        repeat: -1,
        frameRate: 8,
    });

    this.kevin.play("kevin-idle-down");
    this.cursors = this.input.keyboard.createCursorKeys();
    this.physics.add.collider(this.kevin, Objects);
    // this.cameras.main.startFollow(this.kevin, true);

    var FKey = this.input.keyboard.addKey("F");

    FKey.on(
        "down",
        function () {
            if (this.scale.isFullscreen) {
                button.setFrame(0);
                this.scale.stopFullscreen();
            } else {
                button.setFrame(1);
                this.scale.startFullscreen();
            }
        },
        this
    );
}

function update() {
    if (!this.cursors || !this.kevin) return;

    moveKevin(this);
}

const moveKevin = (scene) => {
    const speed = 50;

    let vX = 0,
        vY = 0,
        side = false;
    if (scene.cursors.left?.isDown) {
        scene.kevin.anims.play("kevin-walk-side", true);
        vX = -speed;
        scene.kevin.scaleX = 1;
        scene.kevin.body.offset.x = 25;
        side = true;
    } else if (scene.cursors.right?.isDown) {
        scene.kevin.anims.play("kevin-walk-side", true);
        vX = speed;
        scene.kevin.scaleX = -1;
        scene.kevin.body.offset.x = 41;
        side = true;
    }

    if (scene.cursors.up?.isDown) {
        vY = -speed;
        if (!side) scene.kevin.anims.play("kevin-walk-up", true);
        else {
            vY *= 3 / 4;
            vX *= 3 / 4;
        }
    } else if (scene.cursors.down?.isDown) {
        vY = speed;
        if (!side) {
            scene.kevin.anims.play("kevin-walk-down", true);
        } else {
            vY *= 3 / 4;
            vX *= 3 / 4;
        }
    }
    if (vX === 0 && vY === 0) {
        const parts = scene.kevin.anims.currentAnim.key.split("-");
        parts[1] = "idle";
        scene.kevin.anims.play(parts.join("-"), true);
        scene.kevin.setVelocityX(0);
        scene.kevin.setVelocityY(0);
    } else {
        scene.kevin.setVelocityX(vX);
        scene.kevin.setVelocityY(vY);
    }
};

const debugDraw = (layer, scene) => {
    const debugGraphics = scene.add.graphics().setAlpha(0.7);
    layer.renderDebug(debugGraphics, {
        tileColor: null,
        collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255),
        faceColor: new Phaser.Display.Color(40, 39, 37, 255),
    });
};
