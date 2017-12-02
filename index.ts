class Startup {

    public main(): number {
        d3.selectAll("p").style("color", "white");
        return 1;
    }
}

new Startup().main();