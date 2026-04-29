package com.example.paint.backend.paint.services.shapes;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;

import static org.assertj.core.api.Assertions.*;

class ShapeFactoryTest {

    private ShapeFactory factory;

    @BeforeEach
    void setUp() {
        factory = new ShapeFactory();
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private ShapeDTO dto(String name) {
        ShapeDTO d = new ShapeDTO();
        d.name = name; d.id = "1"; d.fill = "#fff"; d.stroke = "black";
        d.strokeWidth = 3; d.draggable = true; d.x = 100; d.y = 100;
        return d;
    }

    private ShapeDTO polygonDto(String name, int sides, double radius) {
        ShapeDTO d = dto(name);
        d.sides = sides; d.radius = radius;
        return d;
    }

    // ── createShape from DTO ──────────────────────────────────────────────────

    @Test
    void square_dto_returnsSquareInstance() {
        assertThat(factory.createShape(dto("square"))).isInstanceOf(Square.class);
    }

    @Test
    void rectangle_dto_returnsRectangleInstance() {
        assertThat(factory.createShape(dto("rectangle"))).isInstanceOf(Rectangle.class);
    }

    @Test
    void circle_dto_returnsCircleInstance() {
        assertThat(factory.createShape(dto("circle"))).isInstanceOf(Circle.class);
    }

    @Test
    void ellipse_dto_returnsEllipseInstance() {
        assertThat(factory.createShape(dto("ellipse"))).isInstanceOf(Ellipse.class);
    }

    @Test
    void triangle_dto_returnsTriangleWithSides3() {
        ShapeDTO d = polygonDto("triangle", 3, 100);
        Triangle t = (Triangle) factory.createShape(d);
        assertThat(t).isInstanceOf(Triangle.class);
        assertThat(t.getSides()).isEqualTo(3);
    }

    @Test
    void pentagon_dto_returnsTriangleWithSides5() {
        // Pentagon and hexagon share the Triangle backend class — only sides field differs
        ShapeDTO d = polygonDto("pentagon", 5, 70);
        Triangle t = (Triangle) factory.createShape(d);
        assertThat(t).isInstanceOf(Triangle.class);
        assertThat(t.getSides()).isEqualTo(5);
    }

    @Test
    void hexagon_dto_returnsTriangleWithSides6() {
        ShapeDTO d = polygonDto("hexagon", 6, 70);
        Triangle t = (Triangle) factory.createShape(d);
        assertThat(t).isInstanceOf(Triangle.class);
        assertThat(t.getSides()).isEqualTo(6);
    }

    @Test
    void line_dto_returnsLineInstance() {
        assertThat(factory.createShape(dto("line"))).isInstanceOf(Line.class);
    }

    @Test
    void unknown_name_returnsNull() {
        assertThat(factory.createShape(dto("star"))).isNull();
    }

    // ── clone via createShape(Shape) ──────────────────────────────────────────

    @Test
    void createShape_fromCircle_returnsCircleWithOffsetPosition() {
        ShapeDTO d = dto("circle"); d.radius = 60; d.x = 50; d.y = 80;
        Circle original = new Circle(d);
        Circle clone = (Circle) factory.createShape(original);
        assertThat(clone).isInstanceOf(Circle.class);
        assertThat(clone.getX()).isEqualTo(original.getX() + 20);
        assertThat(clone.getY()).isEqualTo(original.getY() + 20);
        assertThat(clone.getRadius()).isEqualTo(original.getRadius());
    }

    // ── clone(idNew) ──────────────────────────────────────────────────────────

    @Test
    void circle_clone_assignsNewIdAndOffsets() throws CloneNotSupportedException {
        ShapeDTO d = dto("circle"); d.radius = 60; d.x = 10; d.y = 20;
        Circle original = new Circle(d);
        Circle copy = original.clone("99");
        assertThat(copy.getId()).isEqualTo("99");
        assertThat(copy.getX()).isEqualTo(original.getX() + 20);
        assertThat(copy.getY()).isEqualTo(original.getY() + 20);
        assertThat(copy.getRadius()).isEqualTo(60);
    }

    @Test
    void line_clone_offsetsYByMinus20() throws CloneNotSupportedException {
        ShapeDTO d = dto("line"); d.y = 100;
        Line original = new Line(d);
        Line copy = original.clone("2");
        assertThat(copy.getY()).isEqualTo(original.getY() - 20);
    }

    @Test
    void triangle_clone_preservesSides() throws CloneNotSupportedException {
        ShapeDTO d = polygonDto("pentagon", 5, 70);
        Triangle original = new Triangle(d);
        Triangle copy = original.clone("3");
        assertThat(copy.getSides()).isEqualTo(5);
        assertThat(copy.getRadius()).isEqualTo(70);
    }

    // ── scaleX/Y default to 1 when DTO sends 0 ───────────────────────────────

    @Test
    void scaleX_defaultsTo1_whenDtoHasZero() {
        ShapeDTO d = dto("square"); d.width = 100; d.height = 100; d.scaleX = 0; d.scaleY = 0;
        Square s = new Square(d);
        assertThat(s.getScaleX()).isEqualTo(1.0);
        assertThat(s.getScaleY()).isEqualTo(1.0);
    }

    // ── pentagon JSON serialisation gap ──────────────────────────────────────

    @Test
    void pentagon_serialisesAsTriangle_inJson() throws IOException {
        // Known design gap: Triangle has @JsonTypeName("triangle") only.
        // A pentagon round-tripped through JSON deserialises with name "triangle".
        // The frontend compensates by using the client-sent name from ShapeDTO.
        ShapeDTO d = polygonDto("pentagon", 5, 70);
        Triangle pentagon = new Triangle(d);
        pentagon.setName("pentagon");

        ObjectMapper mapper = new ObjectMapper();
        String json = mapper.writeValueAsString(pentagon);
        Shape deserialized = mapper.readValue(json, Shape.class);

        assertThat(deserialized.getName()).isEqualTo("triangle");
    }
}
