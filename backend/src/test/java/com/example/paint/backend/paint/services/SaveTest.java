package com.example.paint.backend.paint.services;

import com.example.paint.backend.paint.services.shapes.*;
import org.junit.jupiter.api.Test;

import java.io.IOException;

import static org.assertj.core.api.Assertions.*;

class SaveTest {

    private static Circle circle(String id) {
        ShapeDTO d = new ShapeDTO();
        d.id = id; d.name = "circle"; d.radius = 60;
        d.fill = "#ff0000"; d.stroke = "black"; d.strokeWidth = 3; d.draggable = true;
        d.x = 100; d.y = 200;
        return new Circle(d);
    }

    private static Square square(String id) {
        ShapeDTO d = new ShapeDTO();
        d.id = id; d.name = "square"; d.width = 100; d.height = 100;
        d.fill = "#00ff00"; d.stroke = "black"; d.strokeWidth = 3; d.draggable = true;
        d.scaleX = 1; d.scaleY = 1;
        return new Square(d);
    }

    // ── JSON round-trip ───────────────────────────────────────────────────────

    @Test
    void json_roundTrip_preservesIdCounterAndShapeList() throws IOException {
        Save save = new Save();
        save.setIdCounter("7");
        save.setLastUpdate(java.util.List.of(circle("1"), square("2")));

        String json = save.toJsonString();
        Save loaded = Save.fromJsonString(json);

        assertThat(loaded.getIdCounter()).isEqualTo("7");
        assertThat(loaded.getLastUpdate()).hasSize(2);
        assertThat(loaded.getLastUpdate().get(0).getId()).isEqualTo("1");
        assertThat(loaded.getLastUpdate().get(1).getId()).isEqualTo("2");
    }

    @Test
    void json_roundTrip_preservesCircleFields() throws IOException {
        Save save = new Save();
        save.setIdCounter("1");
        save.setLastUpdate(java.util.List.of(circle("c1")));

        Save loaded = Save.fromJsonString(save.toJsonString());
        Shape shape = loaded.getLastUpdate().get(0);

        assertThat(shape).isInstanceOf(Circle.class);
        assertThat(shape.getFill()).isEqualTo("#ff0000");
        assertThat(shape.getX()).isEqualTo(100);
        assertThat(shape.getY()).isEqualTo(200);
        assertThat(((Circle) shape).getRadius()).isEqualTo(60);
    }

    @Test
    void json_roundTrip_emptyList_producesEmptySave() throws IOException {
        Save save = new Save();
        save.setIdCounter("0");
        save.setLastUpdate(java.util.List.of());

        Save loaded = Save.fromJsonString(save.toJsonString());

        assertThat(loaded.getLastUpdate()).isEmpty();
    }

    // ── XML round-trip ────────────────────────────────────────────────────────

    @Test
    void xml_roundTrip_preservesIdCounterAndShapeCount() throws IOException {
        Save save = new Save();
        save.setIdCounter("3");
        save.setLastUpdate(java.util.List.of(circle("x1")));

        String xml = save.toXmlString();
        Save loaded = Save.fromXmlString(xml);

        assertThat(loaded.getIdCounter()).isEqualTo("3");
        assertThat(loaded.getLastUpdate()).hasSize(1);
    }

    @Test
    void xml_roundTrip_preservesShapeId() throws IOException {
        Save save = new Save();
        save.setIdCounter("1");
        save.setLastUpdate(java.util.List.of(square("sq99")));

        Save loaded = Save.fromXmlString(save.toXmlString());

        assertThat(loaded.getLastUpdate().get(0).getId()).isEqualTo("sq99");
    }
}
