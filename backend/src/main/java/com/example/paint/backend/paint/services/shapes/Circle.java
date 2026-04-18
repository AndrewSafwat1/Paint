package com.example.paint.backend.paint.services.shapes;

import com.fasterxml.jackson.annotation.JsonTypeName;

@JsonTypeName("circle")
public class Circle extends Shape {
    private double radius;

    public Circle(ShapeDTO c) {
        super(c);
        this.radius = c.radius;
    }

    public Circle(Circle c) {
        super(c);
        this.radius = c.radius;
    }

    public Circle() {}

    public double getRadius()          { return radius; }
    public void setRadius(double r)    { this.radius = r; }

    @Override
    public Circle clone(String idNew) throws CloneNotSupportedException {
        Circle copy = new Circle(this);
        copy.setId(idNew);
        return copy;
    }
}
