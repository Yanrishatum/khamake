var KhaExporter = require('./KhaExporter.js');
var korepath = require('./korepath.js');
var Converter = require('./Converter.js');
var Files = require(korepath + 'Files.js');
var Haxe = require('./Haxe.js');
var Options = require('./Options.js');
var Paths = require(korepath + 'Paths.js');
var exportImage = require('./ImageTool.js');
var fs = require('fs');
var path = require('path');
var uuid = require('./uuid.js');

function UnityExporter(directory) {
	KhaExporter.call(this);
	this.directory = directory;
};

UnityExporter.prototype = Object.create(KhaExporter.prototype);
UnityExporter.constructor = UnityExporter;

UnityExporter.prototype.sysdir = function () {
	return 'unity';
};

UnityExporter.prototype.exportSolution = function (name, platform, haxeDirectory, from, callback) {
	this.addSourceDirectory("Kha/Backends/Unity");

	this.createDirectory(this.directory.resolve(this.sysdir()));

	this.writeFile(this.directory.resolve("project-" + this.sysdir() + ".hxproj"));
	this.p("<?xml version=\"1.0\" encoding=\"utf-8\"?>");
	this.p("<project version=\"2\">");
	this.p("<!-- Output SWF options -->", 1);
	this.p("<output>", 1);
	this.p("<movie outputType=\"Application\" />", 2);
	this.p("<movie input=\"\" />", 2);
	this.p("<movie path=\"" + this.sysdir() + "\\Assets\\Sources\" />", 2);
	this.p("<movie fps=\"0\" />", 2);
	this.p("<movie width=\"0\" />", 2);
	this.p("<movie height=\"0\" />", 2);
	this.p("<movie version=\"1\" />", 2);
	this.p("<movie minorVersion=\"0\" />", 2);
	this.p("<movie platform=\"C#\" />", 2);
	this.p("<movie background=\"#FFFFFF\" />", 2);
	if (Files.isDirectory(haxeDirectory)) this.p('<movie preferredSDK="' + from.resolve('build').relativize(haxeDirectory).toString() + '" />', 2);
	this.p("</output>", 1);
	this.p("<!-- Other classes to be compiled into your SWF -->", 1);
	this.p("<classpaths>", 1);
	for (var i = 0; i < this.sources.length; ++i) {
		this.p('<class path="' + from.resolve('build').relativize(from.resolve(this.sources[i])).toString() + '" />', 2);
	}
	this.p("</classpaths>", 1);
	this.p("<!-- Build options -->", 1);
	this.p("<build>", 1);
	this.p("<option directives=\"\" />", 2);
	this.p("<option flashStrict=\"False\" />", 2);
	this.p("<option mainClass=\"Main\" />", 2);
	this.p("<option enabledebug=\"False\" />", 2);
	this.p("<option additional=\"-D no-root&#xA;-D no-compilation&#xA;-net-std " + from.resolve('build').relativize(haxeDirectory).resolve("netlib").toString() + "\" />", 2);
	this.p("</build>", 1);
	this.p("<!-- haxelib libraries -->", 1);
	this.p("<haxelib>", 1);
	this.p("<!-- example: <library name=\"...\" /> -->", 2);
	this.p("</haxelib>", 1);
	this.p("<!-- Class files to compile (other referenced classes will automatically be included) -->", 1);
	this.p("<compileTargets>", 1);
	this.p("<compile path=\"..\\Sources\\Main.hx\" />", 2);
	this.p("</compileTargets>", 1);
	this.p("<!-- Paths to exclude from the Project Explorer tree -->", 1);
	this.p("<hiddenPaths>", 1);
	this.p("<!-- example: <hidden path=\"...\" /> -->", 2);
	this.p("</hiddenPaths>", 1);
	this.p("<!-- Executed before build -->", 1);
	this.p("<preBuildCommand />", 1);
	this.p("<!-- Executed after build -->", 1);
	this.p("<postBuildCommand alwaysRun=\"False\" />", 1);
	this.p("<!-- Other project options -->", 1);
	this.p("<options>", 1);
	this.p("<option showHiddenPaths=\"False\" />", 2);
	this.p("<option testMovie=\"OpenDocument\" />", 2);
	this.p("<option testMovieCommand=\"\" />", 2);
	this.p("</options>", 1);
	this.p("<!-- Plugin storage -->", 1);
	this.p("<storage />", 1);
	this.p("</project>");
	this.closeFile();

	Files.removeDirectory(this.directory.resolve(Paths.get(this.sysdir(), "Assets", "Sources")));

	this.writeFile(this.directory.resolve("project-" + this.sysdir() + ".hxml"));
	for (var i = 0; i < this.sources.length; ++i) {
		this.p("-cp " + from.resolve('build').relativize(from.resolve(this.sources[i])).toString());
	}
	this.p("-cs " + Paths.get(this.sysdir(), "Assets", "Sources").toString());
	this.p("-main Main");
	this.p("-D no-root");
	this.p("-D no-compilation");
	this.p("-net-std " + from.resolve('build').relativize(haxeDirectory).resolve("netlib").toString());
	this.closeFile();

	var options = [];
	options.push("project-" + this.sysdir() + ".hxml");
	var self = this;
	Haxe.executeHaxe(from, haxeDirectory, options, function () {
		var settingsFiles = fs.readdirSync(path.join(__dirname, 'Data', 'unity', 'ProjectSettings'));
		self.createDirectory(self.directory.resolve(Paths.get(self.sysdir(), 'ProjectSettings')));
		for (var f in settingsFiles) {
			var file = settingsFiles[f];
			var text = fs.readFileSync(path.join(__dirname, 'Data', 'unity', 'ProjectSettings', file), { encoding: 'utf8' });
			fs.writeFileSync(self.directory.resolve(Paths.get(self.sysdir(), 'ProjectSettings', file)).toString(), text);
		}
		callback();
	});
};

UnityExporter.prototype.copyMusic = function (platform, from, to, encoders, callback) {
	callback();
};

UnityExporter.prototype.copySound = function (platform, from, to, encoders, callback) {
	callback();
};

UnityExporter.prototype.copyImage = function (platform, from, to, asset, callback) {
	exportImage(from, this.directory.resolve(this.sysdir()).resolve(Paths.get('Assets', 'Images', to)), asset, undefined, false, callback);
};

UnityExporter.prototype.copyBlob = function (platform, from, to, callback) {
	this.copyFile(from, this.directory.resolve(this.sysdir()).resolve(Paths.get('Assets', 'Blobs', to)));
	callback();
};

UnityExporter.prototype.copyVideo = function (platform, from, to, encoders, callback) {
	callback();
};

module.exports = UnityExporter;
