const Desklet = imports.ui.desklet;
const St = imports.gi.St;
const GdkPixbuf = imports.gi.GdkPixbuf;
const Clutter = imports.gi.Clutter;
const Cogl = imports.gi.Cogl;
const GLib = imports.gi.GLib;


function Tf2DispenserClockDesklet(metadata, desklet_id) {
    this._init(metadata, desklet_id);
}

function getImageAtScale(imageFileName, width, height) {
	let pixBuf = GdkPixbuf.Pixbuf.new_from_file_at_size(imageFileName, width, height);
	let image = new Clutter.Image();
	image.set_data(
		pixBuf.get_pixels(),
		pixBuf.get_has_alpha() ? Cogl.PixelFormat.RGBA_8888 : Cogl.PixelFormat.RGBA_888,
		width, height,
		pixBuf.get_rowstride()
	);

	let actor = new Clutter.Actor({width: width, height: height});
	actor.set_content(image);

	return actor;
}


Tf2DispenserClockDesklet.prototype = {
    __proto__: Desklet.Desklet.prototype,

    _init: function(metadata, desklet_id) {
        Desklet.Desklet.prototype._init.call(this, metadata, desklet_id);

        this.setupUI();
    },

    setupUI: function() {
       this.setupImageAndTimer(); 
       this.updateTime();
    },

    setupImageAndTimer:function()
    {
        this.clock = new St.Bin();
		this.image_container = new St.Group({style_class: 'image_container'});

        this.timeContainer =  new St.BoxLayout({vertical:false, style_class: 'time_container'});
        this.timeLabel = new St.Label();
        this.timeContainer.add_actor(this.timeLabel);

        let dispenserImagePath ="/home/burito/.local/share/cinnamon/desklets/t2fdispenserclock@burito/img/dispenser.png";
        
        let scale = global.ui_scale;
        this.height = 432;
        this.width = 300;
		this.clock.set_size(this.width*scale, this.height*scale);

        this.clock_bg = getImageAtScale(dispenserImagePath, this.width*scale, this.height*scale); 

        this.clock.remove_all_children();
		this.image_container.add_actor(this.clock_bg);

        this.clock.add_actor(this.image_container);
        this.image_container.add_actor(this.timeContainer);
		this.setContent(this.clock);
    },

    updateTime:function()
    {
        this._displayTime = new GLib.DateTime();
        let timeoutval = 100;

        let timeFormat = "%H:%M";

        let locale = GLib.getenv("LANG");
        if (locale) {
            // convert $LANG from format "en_GB.UTF-8" to "en-GB"
            locale = GLib.getenv("LANG").replace(/_/g, "-").replace(/\..+/, "");
        } else {
            // fallback local
            locale = "en-US";
        }
        let displayDate = new Date();
        this.timeLabel.set_text(displayDate.toLocaleFormat(timeFormat));

        this.timeout = GLib.timeout_add(GLib.PRIORITY_DEFAULT, timeoutval, () => { this.updateTime() });
    }
}

function main(metadata, desklet_id) {
    return new Tf2DispenserClockDesklet(metadata, desklet_id);
}