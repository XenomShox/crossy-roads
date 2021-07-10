var GameScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function GameScene() {
        Phaser.Scene.call(this, { key: "GameScene" });
    },
    preload: function () {
        this.load.image("tiles", "assets/tileset/city_tiles.png");
        this.load.image("car1", "assets/Cars/car1.png");
        this.load.image("car2", "assets/Cars/car2.png");
        this.load.image("car3", "assets/Cars/car3.png");
        this.load.image("car1V", "assets/Cars/car1V.png");
        this.load.image("car2V", "assets/Cars/car2V.png");
        this.load.image("car3V", "assets/Cars/car3V.png");
        this.load.image("car4V", "assets/Cars/car4V.png");
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
    },
    create: function () {
        const map = this.make.tilemap({ key: "city" });
        const tileset = map.addTilesetImage("city", "tiles");

        map.createLayer("ground", tileset);
        //create cars
        let carsV = [
                this.CreateCar(76, 50, 1),
                this.CreateCar(100, 50, 1),
                this.CreateCar(142, 50),
                this.CreateCar(164, 50),
            ],
            carsH = [
                this.CreateCar(142, 50, 1, true),
                //this.CreateCar(142, 150, 1, true),
                this.CreateCar(142, 250, 0, true),
                //this.CreateCar(542, 250, 0, true),
            ];

        this.cars = this.physics.add.group();
        this.cars.addMultiple(carsV);
        this.cars.addMultiple(carsH);

        const Obstacles = map.createLayer("Obstacles", tileset);
        this.kevin = this.physics.add.sprite(20, 20, "kevin", "down-idle-0.png").setScale(scale);
        map.createLayer("Objects", tileset);

        Obstacles.setCollisionByProperty({ collides: true });

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
        this.physics.add.collider(this.kevin, Obstacles);
        // this.cameras.main.startFollow(this.kevin, true);
        this.kevin.setCollideWorldBounds(true);

        this.physics.world.on("collisionstart", function (event, bodyA, bodyB) {
            console.log("collision", event, bodyA, bodyB);
        });

        this.physics.add.overlap(
            this.kevin,
            this.cars,
            function (player, car) {
                this.events.emit("Game_Over");
            },
            null,
            this
        );
    },
    update: function () {
        if (!this.cursors || !this.kevin) return;
        this.moveKevin();
        this.moveCars();
    },
    moveKevin: function () {
        const speed = 50;

        let vX = 0,
            vY = 0,
            side = false;
        if (this.cursors.left?.isDown) {
            this.kevin.anims.play("kevin-walk-side", true);
            vX = -speed;
            this.kevin.scaleX = scale;
            this.kevin.body.offset.x = 25;
            side = true;
        } else if (this.cursors.right?.isDown) {
            this.kevin.anims.play("kevin-walk-side", true);
            vX = speed;
            this.kevin.scaleX = -scale;
            this.kevin.body.offset.x = 41;
            side = true;
        }

        if (this.cursors.up?.isDown) {
            vY = -speed;
            if (!side) this.kevin.anims.play("kevin-walk-up", true);
            else {
                vY *= 3 / 4;
                vX *= 3 / 4;
            }
        } else if (this.cursors.down?.isDown) {
            vY = speed;
            if (!side) {
                this.kevin.anims.play("kevin-walk-down", true);
            } else {
                vY *= 3 / 4;
                vX *= 3 / 4;
            }
        }
        if (this.cursors.shift?.isDown) {
            vX *= 2.5;
            vY *= 2.5;
        }
        if (vX === 0 && vY === 0) {
            const parts = this.kevin.anims.currentAnim.key.split("-");
            parts[1] = "idle";
            this.kevin.anims.play(parts.join("-"), true);
            this.kevin.setVelocityX(0);
            this.kevin.setVelocityY(0);
        } else {
            this.kevin.setVelocityX(vX);
            this.kevin.setVelocityY(vY);
        }
    },
    CreateCar: function (x, y, d = 0, h = false) {
        let car = this.physics.add
            .sprite(x, y, "car" + (Math.floor(Math.random() * 3) + 1) + (h ? "V" : ""))
            .setRotation(Math.PI * d)
            .setScale(0.5);
        car.Horizantal = h;
        car.Direction = d == 0 ? 1 : -1;
        //console.log(car);
        return car;
    },
    moveCars: function () {
        this.cars.getChildren().forEach((car) => {
            if (car.Horizantal) {
                car.setVelocityX(40 * car.Direction);
                console.log();
                if (car.x > this.scale.width && car.Direction > 0) car.x = -car.width / 2;
                if (car.x + car.width / 2 < 0 && car.Direction < 0) car.x = this.scale.width;
                //if(this.scale.height);
            } else car.setVelocityY(40 * car.Direction);
        });
    },
});
var UIScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function GameScene() {
        Phaser.Scene.call(this, { key: "UIScene", active: true });
        this.Score = 0;
        this.MaxScore = Number(window.localStorage.getItem("maxCrossRoad") || 0);
    },
    preload: function () {},
    create: function () {
        var info = this.add.text(10, 10, "Score: 0", { font: "15px Arial", fill: "#B02FF0" });

        //GameOver.disableBody(true, false);
        //  Grab a reference to the Game Scene
        var ourGame = this.scene.get("GameScene");

        //  Listen for events from it
        let $this = this;
        ourGame.events.on("Game_Over", function () {
            console.log("Game OVer");
            $this.scene.pause("GameScene");
            console.log("Game OVered");
            $this.GameOver = $this.add.text(
                $this.cameras.main.centerX - 150,
                $this.cameras.main.centerY - 30,
                "Game Over",
                { font: "50px Arial", fill: "#B02FF0" }
            );
        });
        ourGame.events.on(
            "addScore",
            function () {
                this.score += 10;

                info.setText("Score: " + this.score);
            },
            this
        );
    },
});
var config = {
    type: Phaser.AUTO,
    //width: window.innerWidth,
    //height: window.innerHeight,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: true,
        },
    },
    scene: [GameScene, UIScene],
    scale: {
        width: 16 * 43,
        height: 16 * 20,
        zoom: 2,
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
};

var game = new Phaser.Game(config);

var scale = 0.6;
