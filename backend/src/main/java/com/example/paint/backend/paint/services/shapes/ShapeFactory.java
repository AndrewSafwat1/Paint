package com.example.paint.backend.paint.services.shapes;

import org.springframework.stereotype.Component;

@Component
public class ShapeFactory {

    public Shape createShape(ShapeDTO dto) {
        switch (dto.name) {
            case "line":      return new Line(dto);
            case "square":    return new Square(dto);
            case "rectangle": return new Rectangle(dto);
            case "ellipse":   return new Ellipse(dto);
            case "circle":    return new Circle(dto);
            case "triangle":
            case "pentagon":
            case "hexagon":   return new Triangle(dto);
            default:          return null;
        }
    }

    public Shape createShape(Shape s) {
        switch (s.getName()) {
            case "line":      return new Line((Line) s);
            case "square":    return new Square((Square) s);
            case "rectangle": return new Rectangle((Rectangle) s);
            case "ellipse":   return new Ellipse((Ellipse) s);
            case "circle":    return new Circle((Circle) s);
            case "triangle":
            case "pentagon":
            case "hexagon":   return new Triangle((Triangle) s);
            default:          return null;
        }
    }
}
