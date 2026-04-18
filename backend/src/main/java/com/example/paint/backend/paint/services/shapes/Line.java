package com.example.paint.backend.paint.services.shapes;

import com.fasterxml.jackson.annotation.JsonTypeName;
import java.util.ArrayList;

@JsonTypeName("line")
public class Line extends shape{
    private ArrayList<Double> points;
    private String lineCap ;
    private String lineJoin ;
    public Line (shapeDTO l) {
        super(l);
        this.points = l.points ;
        this.lineCap = l.lineCap ;
        this.lineJoin = l.lineJoin ;
    }
    public Line () {}
    public Line (Line l) {
        super(l);
        this.points = l.points ;
        this.lineCap = l.lineCap ;
        this.lineJoin = l.lineJoin ;
    }

    public ArrayList<Double> getPoints() {
        return points;
    }

    public String getLineCap() {
        return lineCap;
    }

    public String getLineJoin() {
        return lineJoin;
    }

    public void setLineCap(String lineCap) {
        this.lineCap = lineCap;
    }

    public void setLineJoin(String lineJoin) {
        this.lineJoin = lineJoin;
    }

    public void setPoints(ArrayList<Double> points) {
        this.points = points;
    }

    public void drawShape() {

    }
    @Override
    public Line clone(String idNew) throws CloneNotSupportedException{
        Line newShape = new Line(this);
        newShape.setId(idNew);
        newShape.setY(newShape.getY()-20);
        return newShape ;
    }
}
