package com.example.paint.backend.paint.services.shapes;

import com.fasterxml.jackson.annotation.JsonTypeName;

@JsonTypeName("rectangle")
public class Rectangle extends Shape {
    private double width;
    private double height;

    public Rectangle(ShapeDTO r) {
        super(r);
        this.width  = r.width;
        this.height = r.height;
    }

    public Rectangle(Rectangle r) {
        super(r);
        this.width  = r.width;
        this.height = r.height;
    }

    public Rectangle() {}

    public double getWidth()  { return width; }
    public double getHeight() { return height; }

    public void setWidth(double width)   { this.width  = width; }
    public void setHeight(double height) { this.height = height; }

    @Override
    public Rectangle clone(String idNew) throws CloneNotSupportedException {
        Rectangle copy = new Rectangle(this);
        copy.setId(idNew);
        return copy;
    }
}
