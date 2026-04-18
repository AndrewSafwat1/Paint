package com.example.paint.backend.paint.services.shapes;

import com.fasterxml.jackson.annotation.JsonTypeName;

@JsonTypeName("rectangle")
public class Rectangle extends shape {
    private double width ;
    private double height ;
    public Rectangle(shapeDTO r){
        super(r);
        this.height = r.height ;
        this.width = r.width ;
    }
    public Rectangle(Rectangle r){
        super(r);
        this.height = r.height ;
        this.width = r.width ;
    }

    public Rectangle(){}

    public double getHeight() {
        return height;
    }

    public double getWidth() {
        return width;
    }

    public void setHeight(double height) {
        this.height = height;
    }

    public void setWidth(double width) {
        this.width = width;
    }


    public void drawShape() {

    }
    @Override
    public Rectangle clone(String idNew) throws CloneNotSupportedException{
        Rectangle newShape = new Rectangle(this);
        newShape.setId(idNew);
        return newShape ;
    }
}
