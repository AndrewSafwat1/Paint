package com.example.paint.backend.paint.services.shapes;

public class ShapeFactory {
    public shape createShape(shapeDTO dto){

        switch (dto.name ){
            case "line":
                return new Line(dto) ;
            case "square":
                return new Square(dto) ;
            case "rectangle" :
                return new Rectangle(dto) ;
            case "elipse" :
                return new Elipse(dto) ;
            case "circle" :
                return new Circle(dto) ;
            case "triangle" :
                return new Triangle(dto) ;
            case "pentagon" :
                return new Triangle(dto) ;
            case "hexagon" :
                return new Triangle(dto) ;
            default :
                return null ;
        }
    }
    public shape createShape(shape s){

        switch (s.getName() ){
            case "line":
                return new Line((Line) s) ;
            case "square":
                return new Square((Square) s) ;
            case "rectangle" :
                return new Rectangle((Rectangle) s) ;
            case "elipse" :
                return new Elipse((Elipse) s) ;
            case "circle" :
                return new Circle((Circle) s) ;
            case "triangle" :
                return new Triangle((Triangle) s) ;
            case "pentagon" :
                return new Triangle((Triangle) s) ;
            case "hexagon" :
                return new Triangle((Triangle) s) ;
            default :
                return null ;
        }
    }

}
