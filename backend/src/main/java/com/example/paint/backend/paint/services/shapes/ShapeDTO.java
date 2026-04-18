package com.example.paint.backend.paint.services.shapes;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.ArrayList;


@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(value = JsonInclude.Include.NON_DEFAULT)
public class ShapeDTO {
    public double x;
    public double y;
    public String id;
    public String fill;
    public String name;
    public String stroke;
    public double strokeWidth;
    public double rotation;
    public boolean draggable;
    public double radius;
    public int sides;
    public ArrayList<Double> points;
    public String lineCap;
    public String lineJoin;
    public double radiusX;
    public double radiusY;
    public double width;
    public double height;
    public double scaleY;
    public double scaleX;
}
