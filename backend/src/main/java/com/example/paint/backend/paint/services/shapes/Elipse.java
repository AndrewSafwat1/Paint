package com.example.paint.backend.paint.services.shapes;

import com.fasterxml.jackson.annotation.JsonTypeName;

@JsonTypeName("elipse")

public class Elipse extends shape{
    private double radiusX;
    private double radiusY;

    public Elipse(shapeDTO e){
        super(e);
        this.radiusX = e.radiusX ;
        this.radiusY = e.radiusY ;
    }
    public Elipse (){}

    public Elipse(Elipse e){
        super(e);
        this.setRadiusX( e.getRadiusX() );
        this.setRadiusY( e.getRadiusY() );

    }
    public double getRadiusX() {
        return radiusX;
    }

    public double getRadiusY() {
        return radiusY;
    }

    public void setRadiusX(double radiusX) {
        this.radiusX = radiusX;
    }

    public void setRadiusY(double radiusY) {
        this.radiusY = radiusY;
    }
    @Override
    public Elipse clone(String idNew) throws CloneNotSupportedException{
        Elipse newShape = new Elipse(this);
        newShape.setId(idNew);
        return newShape ;
    }
}
