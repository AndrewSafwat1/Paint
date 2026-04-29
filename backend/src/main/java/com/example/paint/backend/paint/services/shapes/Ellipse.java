package com.example.paint.backend.paint.services.shapes;

import com.fasterxml.jackson.annotation.JsonTypeName;

@JsonTypeName("ellipse")
public class Ellipse extends Shape {
    private double radiusX;
    private double radiusY;

    public Ellipse(ShapeDTO e) {
        super(e);
        this.radiusX = e.radiusX;
        this.radiusY = e.radiusY;
    }

    public Ellipse(Ellipse e) {
        super(e);
        this.radiusX = e.radiusX;
        this.radiusY = e.radiusY;
    }

    public Ellipse() {}

    public double getRadiusX() { return radiusX; }
    public double getRadiusY() { return radiusY; }

    public void setRadiusX(double radiusX) { this.radiusX = radiusX; }
    public void setRadiusY(double radiusY) { this.radiusY = radiusY; }

    @Override
    public Ellipse clone(String idNew) throws CloneNotSupportedException {
        Ellipse copy = new Ellipse(this);
        copy.setId(idNew);
        return copy;
    }
}
