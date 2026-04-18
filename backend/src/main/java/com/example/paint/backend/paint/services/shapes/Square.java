package com.example.paint.backend.paint.services.shapes;

import com.fasterxml.jackson.annotation.JsonTypeName;

@JsonTypeName("square")
public class Square extends Shape {
    private double width;
    private double height;

    public Square(ShapeDTO s) {
        super(s);
        this.width  = s.width;
        this.height = s.height;
    }

    public Square(Square s) {
        super(s);
        this.width  = s.width;
        this.height = s.height;
    }

    public Square() {}

    public double getWidth()  { return width; }
    public double getHeight() { return height; }

    public void setWidth(double width)   { this.width  = width; }
    public void setHeight(double height) { this.height = height; }

    @Override
    public Square clone(String idNew) throws CloneNotSupportedException {
        Square copy = new Square(this);
        copy.setId(idNew);
        return copy;
    }
}
