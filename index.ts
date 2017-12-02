class Startup {

    public main(): number {
        d3.selectAll("p").style("color", "white");
        $("p").hide();
        return 1;
    }
}

new Startup().main();