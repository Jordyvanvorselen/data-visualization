class Startup {

    public main(): number {
        d3.selectAll("p").style("color", "white");
        $("p").hide();
        console.log('test');
        return 1;
    }
}

new Startup().main();