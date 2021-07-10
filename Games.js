var R;
var GameScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function GameScene() {
        Phaser.Scene.call(this, { key: "GameScene" });
    },
    preload: function () {
        this.load.image("tiles", "assets/tileset/city_tiles.png");
        this.load.image("score", "assets/score.png");
        this.load.image("car1", "assets/Cars/car1.png");
        this.load.image("car2", "assets/Cars/car2.png");
        this.load.image("car3", "assets/Cars/car3.png");
        this.load.image("car1V", "assets/Cars/car1V.png");
        this.load.image("car2V", "assets/Cars/car2V.png");
        this.load.image("car3V", "assets/Cars/car3V.png");
        this.load.tilemapTiledJSON("city", "assets/maps/city_2.json");

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

        const ground = map.createLayer("ground", tileset);
        const roads = map.createLayer("roads", tileset);
        const Obstacles = map.createLayer("obstacles", tileset);
        R = this.roads = {
            Up1: {
                x: 197,
                dx: 0,
                d: 1,
                speed: 1,
                cars: [],
            },
            Up2: {
                x: 837,
                h: false,
                dx: 20,
                d: 1,
                speed: 1,
                cars: [],
            },
            Down1: {
                x: 197,
                h: false,
                dx: 0,
                d: -1,
                speed: 1,
                cars: [],
            },
            Down2: {
                x: 837,
                h: false,
                dx: 20,
                d: -1,
                speed: 1,
                cars: [],
            },
            Right1: {
                y: 197,
                h: true,
                dy: 0,
                d: 1,
                speed: 1,
                cars: [],
            },
            Right2: {
                y: 837,
                h: true,
                dy: 20,
                d: 1,
                speed: 1,
                cars: [],
            },
            Left1: {
                y: 197,
                h: true,
                dy: 0,
                d: -1,
                speed: 1,
                cars: [],
            },
            Left2: {
                y: 837,
                h: true,
                dy: 20,
                d: -1,
                speed: 1,
                cars: [],
            },
        };
        //create cars

        let carsV = [
                this.CreateCar(197, 50, 1),
                this.CreateCar(197, 200, 1),
                this.CreateCar(197, 350, 1),
                this.CreateCar(171, 50),
                this.CreateCar(171, 200),
                this.CreateCar(171, 350),
                // right
                this.CreateCar(837, 150, 1),
                this.CreateCar(837, 300, 1),
                this.CreateCar(837, 450, 1),
                this.CreateCar(811, 150),
                this.CreateCar(811, 300),
                this.CreateCar(811, 450),
            ],
            carsH = [
                this.CreateCar(0, 124, 1, true),
                this.CreateCar(200, 124, 1, true),
                this.CreateCar(400, 124, 1, true),
                this.CreateCar(600, 124, 1, true),
                this.CreateCar(800, 124, 1, true),
                this.CreateCar(0, 149, 0, true),
                this.CreateCar(200, 149, 0, true),
                this.CreateCar(400, 149, 0, true),
                this.CreateCar(600, 149, 0, true),
                this.CreateCar(800, 149, 0, true),
                // d0wn
                this.CreateCar(0, 364, 1, true),
                this.CreateCar(200, 364, 1, true),
                this.CreateCar(400, 364, 1, true),
                this.CreateCar(600, 364, 1, true),
                this.CreateCar(800, 364, 1, true),
                this.CreateCar(0, 389, 0, true),
                this.CreateCar(200, 389, 0, true),
                this.CreateCar(400, 389, 0, true),
                this.CreateCar(600, 389, 0, true),
                this.CreateCar(800, 389, 0, true),
            ];

        this.cars = this.physics.add.group();
        this.cars.addMultiple(carsV); //[this.CreateCar("Up1")]); //
        this.cars.addMultiple(carsH);

        this.stars = this.physics.add.group();
        this.stars.addMultiple([
            this.CreateStar(145, 100),
            this.CreateStar(145, 150),
            this.CreateStar(220, 180),
            this.CreateStar(145, 150),
            this.CreateStar(185, 330),
            this.CreateStar(790, 150),
            this.CreateStar(820, 100),
            this.CreateStar(825, 330),
            this.CreateStar(145, 430),
            this.CreateStar(145, 150),
            this.CreateStar(145, 150),
            this.CreateStar(145, 150),
            this.CreateStar(145, 150),
            this.CreateStar(145, 150),
            this.CreateStar(145, 150),
            this.CreateStar(145, 150),
            this.CreateStar(145, 150),
        ]);
        this.kevin = this.physics.add
            .sprite(20, 20, "kevin", "down-idle-0.png")
            .setScale(scale);
        const toBeDrawnOn = map.createLayer("toBeDrawnOn", tileset);
        // map.createLayer("Objects", tileset);

        roads.setCollisionByProperty({ collides: true });
        Obstacles.setCollisionByProperty({ collides: true });
        // debugDraw(Obstacles, this);
        // debugDraw(roads, this);

        this.kevin.body.setSize(16, 8);
        this.kevin.body.offset.y = 40;

        this.CreateAnimations();
        this.kevin.play("kevin-idle-down");
        this.cursors = this.input.keyboard.createCursorKeys();
        this.physics.add.collider(this.kevin, Obstacles);
        // this.cameras.main.startFollow(this.kevin, true);
        this.kevin.setCollideWorldBounds(true);

        this.physics.add.overlap(
            this.kevin,
            this.stars,
            function (player, star) {
                star.disableBody(true, true);
                this.stars.remove(star);
                this.events.emit("addScore");
            },
            null,
            this
        );
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
    CreateStar: function (x, y) {
        return this.physics.add.sprite(x, y, "score");
    },
    CreateAnimations: function () {
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
        //console.log(this.roads[road]);
        /*let car;
        if (this.roads[road].h)
            car = this.physics.add.sprite(
                this.roads[road].cars.length * this.roads[road].dy,
                this.roads[road].y,
                "car" + (Math.floor(Math.random() * 3) + 1) + "V"
            );
        else
            car = this.physics.add.sprite(
                this.roads[road].x,
                this.roads[road].cars.length * this.roads[road].dx,
                "car" + (Math.floor(Math.random() * 3) + 1)
            );*/
        //car.setRotation(Math.PI * (this.roads[road].d > 0 ? 1 : 0)).setScale(0.5);
        let car = this.physics.add
            .sprite(
                x,
                y,
                "car" + (Math.floor(Math.random() * 3) + 1) + (h ? "V" : "")
            )
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
                if (car.x > this.scale.width && car.Direction > 0)
                    car.x = -car.width / 2;
                if (car.x + car.width / 2 < 0 && car.Direction < 0)
                    car.x = this.scale.width;
                //if(this.scale.height);
            } else {
                car.setVelocityY(40 * car.Direction);
                if (car.y > this.scale.height && car.Direction > 0)
                    car.y = -car.height / 2;
                if (car.y + car.height / 2 < 0 && car.Direction < 0)
                    car.y = this.scale.height;
            }
        });
    },
});
var UIScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function GameScene() {
        Phaser.Scene.call(this, { key: "UIScene", active: true });
        this.MaxScore = Number(
            window.localStorage.getItem("maxCrossRoad") || Infinity
        );
        this.started = Date.now();
        console.log(this.started);
    },
    preload: function () {},
    create: function () {
        this.info = this.add.text(310, 10, "Score: 0", {
            font: "15px Arial",
            fill: "#B02FF0",
        });
        this.Maxinfo = this.add.text(600, 10, "Best Score: " + this.MaxScore, {
            font: "15px Arial",
            fill: "#B02FF0",
        });

        //GameOver.disableBody(true, false);
        //  Grab a reference to the Game Scene
        var ourGame = this.scene.get("GameScene");

        //  Listen for events from it
        let $this = this;
        ourGame.events.on("Game_Over", function () {
            $this.scene.pause("GameScene");
            $this.GameOver = $this.add.text(
                $this.cameras.main.centerX - 150,
                $this.cameras.main.centerY - 30,
                "Game Over",
                { font: "50px Arial", fill: "#B02FF0" }
            );
            $this.scene.pause("UIScene");
        });
        ourGame.events.on(
            "addScore",
            function () {
                if (ourGame.stars.getLength() == 0) {
                    $this.GameOver = $this.add.text(
                        $this.cameras.main.centerX - 150,
                        $this.cameras.main.centerY - 30,
                        "You won",
                        { font: "50px Arial", fill: "#B02FF0" }
                    );
                    let max = (Date.now() - this.started) / 1000;
                    if (max < $this.MaxScore)
                        window.localStorage.setItem("maxCrossRoad", max);
                    $this.scene.pause("GameScene");
                    $this.scene.pause("UIScene");
                }
            },
            this
        );
    },
    update: function () {
        this.info.setText("Time passed: " + (Date.now() - this.started) / 1000);
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
        width: 16 * 65,
        height: 16 * 30,
        zoom: 2,
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
};

var game = new Phaser.Game(config);

var scale = 0.6;
const debugDraw = (layer, scene) => {
    const debugGraphics = scene.add.graphics().setAlpha(0.7);
    layer.renderDebug(debugGraphics, {
        tileColor: null,
        collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255),
        faceColor: new Phaser.Display.Color(40, 39, 37, 255),
    });
};
