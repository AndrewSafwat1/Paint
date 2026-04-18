package com.example.paint.backend.paint.services.shapes;

import com.fasterxml.jackson.annotation.JsonTypeName;

@JsonTypeName("triangle")
public class Triangle extends shape{ // this class can also be for pentagon and hexagon according to number of sides
    private double radius ;
    private int sides ;

    public Triangle (shapeDTO t){
        super(t);
        this.radius = t.radius ;
        this.sides = t.sides ;
    }

    public Triangle (Triangle t){
        super(t);
        this.radius = t.radius ;
        this.sides = t.sides ;
    }

    public Triangle(){}

    public double getRadius() {
        return radius;
    }

    public int getSides() {
        return sides;
    }

    public void setRadius(double radius) {
        this.radius = radius;
    }

    public void setSides(int sides) {
        this.sides = sides;
    }

    @Override
    public Triangle clone(String idNew) throws CloneNotSupportedException{

        Triangle newShape = new Triangle(this);
        newShape.setId(idNew);

        return newShape ;
    }
}
