package com.example.paint.backend.paint.services.shapes;

import com.fasterxml.jackson.annotation.JsonTypeName;

@JsonTypeName("circle")
public class Circle extends shape {
    private double radius ;
    public Circle(shapeDTO c){
        super(c);
        this.radius = c.radius ;
    }
    public Circle() {}



    public Circle(Circle c){
        super(c);
        this.setRadius( c.getRadius() );
    }

    public double getRadius() {
        return radius;
    }

    public void setRadius(double radius) {
        this.radius = radius;
    }


    public void drawShape() {

    }
    @Override
    public shape clone(String idNew) throws CloneNotSupportedException{
        Circle newShape = new Circle(this);
        newShape.setId(idNew);
        return newShape ;
    }
}
