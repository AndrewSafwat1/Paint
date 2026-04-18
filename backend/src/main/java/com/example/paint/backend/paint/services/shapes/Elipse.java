package com.example.paint.backend.paint.services.shapes;

import com.fasterxml.jackson.annotation.JsonTypeName;

@JsonTypeName("elipse")
public class Elipse extends Shape {
    private double radiusX;
    private double radiusY;

    public Elipse(ShapeDTO e) {
        super(e);
        this.radiusX = e.radiusX;
        this.radiusY = e.radiusY;
    }

    public Elipse(Elipse e) {
        super(e);
        this.radiusX = e.radiusX;
        this.radiusY = e.radiusY;
    }

    public Elipse() {}

    public double getRadiusX() { return radiusX; }
    public double getRadiusY() { return radiusY; }

    public void setRadiusX(double radiusX) { this.radiusX = radiusX; }
    public void setRadiusY(double radiusY) { this.radiusY = radiusY; }

    @Override
    public Elipse clone(String idNew) throws CloneNotSupportedException {
        Elipse copy = new Elipse(this);
        copy.setId(idNew);
        return copy;
    }
}
