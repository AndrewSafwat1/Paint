package com.example.paint.backend.paint.services.shapes;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "name", include = JsonTypeInfo.As.PROPERTY, visible = true)
@JsonSubTypes({
        @JsonSubTypes.Type(value = Square.class,    name = "square"),
        @JsonSubTypes.Type(value = Circle.class,    name = "circle"),
        @JsonSubTypes.Type(value = Ellipse.class,   name = "ellipse"),
        @JsonSubTypes.Type(value = Rectangle.class, name = "rectangle"),
        @JsonSubTypes.Type(value = Line.class,      name = "line"),
        @JsonSubTypes.Type(value = Triangle.class,  name = "triangle"),
        @JsonSubTypes.Type(value = Triangle.class,  name = "pentagon"),
        @JsonSubTypes.Type(value = Triangle.class,  name = "hexagon")
})
@JsonIgnoreProperties(value = "attributes", ignoreUnknown = true)
public abstract class Shape implements Cloneable {
    private double x;
    private double y;
    private String id;
    private String fill;
    private String name;
    private String stroke;
    private double strokeWidth;
    private double rotation;
    private boolean draggable;
    private double scaleY;
    private double scaleX;

    public Shape(ShapeDTO dto) {
        this.x           = dto.x;
        this.y           = dto.y;
        this.id          = dto.id;
        this.fill        = dto.fill;
        this.name        = dto.name;
        this.stroke      = dto.stroke;
        this.strokeWidth = dto.strokeWidth;
        this.rotation    = dto.rotation;
        this.draggable   = dto.draggable;
        this.scaleX      = dto.scaleX == 0 ? 1 : dto.scaleX;
        this.scaleY      = dto.scaleY == 0 ? 1 : dto.scaleY;
    }

    public Shape(Shape s) {
        this.x           = s.x + 20;
        this.y           = s.y + 20;
        this.id          = s.id;
        this.fill        = s.fill;
        this.name        = s.name;
        this.stroke      = s.stroke;
        this.strokeWidth = s.strokeWidth;
        this.rotation    = s.rotation;
        this.draggable   = s.draggable;
        this.scaleX      = s.scaleX;
        this.scaleY      = s.scaleY;
    }

    public Shape() {}

    public abstract Shape clone(String idNew) throws CloneNotSupportedException;

    @JsonIgnore public String getName()        { return name; }
    public double getRotation()    { return rotation; }
    public double getStrokeWidth() { return strokeWidth; }
    public double getX()           { return x; }
    public double getY()           { return y; }
    public String getFill()        { return fill; }
    public String getId()          { return id; }
    public String getStroke()      { return stroke; }
    public boolean getDraggable()  { return draggable; }
    public double getScaleX()      { return scaleX; }
    public double getScaleY()      { return scaleY; }

    @JsonProperty("name") public void setName(String name) { this.name = name; }
    public void setId(String id)               { this.id = id; }
    public void setDraggable(boolean d)        { this.draggable = d; }
    public void setFill(String fill)           { this.fill = fill; }
    public void setRotation(double rotation)   { this.rotation = rotation; }
    public void setStroke(String stroke)       { this.stroke = stroke; }
    public void setStrokeWidth(double sw)      { this.strokeWidth = sw; }
    public void setX(double x)                 { this.x = x; }
    public void setY(double y)                 { this.y = y; }
    public void setScaleX(double scaleX)       { this.scaleX = scaleX; }
    public void setScaleY(double scaleY)       { this.scaleY = scaleY; }
}
