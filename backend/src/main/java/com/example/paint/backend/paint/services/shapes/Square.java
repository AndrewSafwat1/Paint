package com.example.paint.backend.paint.services.shapes;

import com.example.paint.backend.paint.services.PaintService;
import com.fasterxml.jackson.annotation.JsonTypeName;

@JsonTypeName("square")
public class Square extends shape{
    private double width ;
    private double height ;
    public Square(shapeDTO s){
        super(s);
        this.height = s.height ;
        this.width = s.width ;
    }
    public Square(Square s){
        super(s);
        this.height = s.height ;
        this.width = s.width ;
    }
    public Square(){}

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
    @Override
    public Square clone(String idNew)throws CloneNotSupportedException{
        Square newShape = new Square(this);
        newShape.setId(idNew);
        return newShape ;
    }

}
