package com.example.paint.backend.paint.services;

import com.example.paint.backend.paint.services.shapes.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

class PaintServiceTest {

    private PaintService service;

    @BeforeEach
    void setUp() {
        service = new PaintService();
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Circle circle(String id) {
        ShapeDTO dto = new ShapeDTO();
        dto.id = id; dto.name = "circle"; dto.radius = 60;
        dto.fill = "#fff"; dto.stroke = "black"; dto.strokeWidth = 3; dto.draggable = true;
        return new Circle(dto);
    }

    private Square square(String id) {
        ShapeDTO dto = new ShapeDTO();
        dto.id = id; dto.name = "square"; dto.width = 100; dto.height = 100;
        dto.fill = "#fff"; dto.stroke = "black"; dto.strokeWidth = 3; dto.draggable = true;
        return new Square(dto);
    }

    // ── undo / redo ───────────────────────────────────────────────────────────

    @Test
    void undo_withOneShape_returnsEmptyList() {
        service.addShape(circle("1"));
        List<Shape> result = service.undo();
        assertThat(result).isEmpty();
    }

    @Test
    void undo_onEmptyStack_returnsEmptyListWithoutThrowing() {
        assertThatNoException().isThrownBy(() -> {
            List<Shape> result = service.undo();
            assertThat(result).isEmpty();
        });
    }

    @Test
    void undo_redo_roundTrip() {
        service.addShape(circle("1"));
        service.addShape(square("2"));

        List<Shape> afterUndo = service.undo();
        assertThat(afterUndo).hasSize(1);
        assertThat(afterUndo.get(0).getId()).isEqualTo("1");

        List<Shape> afterRedo = service.redo();
        assertThat(afterRedo).hasSize(2);
    }

    @Test
    void redo_onEmptyRedoStack_returnsCurrentStateWithoutThrowing() {
        service.addShape(circle("1"));
        assertThatNoException().isThrownBy(() -> {
            List<Shape> result = service.redo();
            assertThat(result).hasSize(1);
        });
    }

    @Test
    void addShape_then_newShape_clearsRedoStack() {
        service.addShape(circle("1"));
        service.undo();
        service.addShape(square("2"));
        // redo stack was wiped — redo has no effect
        List<Shape> afterRedo = service.redo();
        assertThat(afterRedo).hasSize(1);
        assertThat(afterRedo.get(0).getId()).isEqualTo("2");
    }

    // ── removeShape ───────────────────────────────────────────────────────────

    @Test
    void removeShape_removesOnlyTargetAndPreservesOrder() {
        service.addShape(circle("1"));
        service.addShape(square("2"));
        service.addShape(circle("3"));

        List<Shape> result = service.removeShape("2");

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getId()).isEqualTo("1");
        assertThat(result.get(1).getId()).isEqualTo("3");
    }

    @Test
    void removeShape_removedId_notFoundByGetShapeById() {
        service.addShape(circle("1"));
        service.removeShape("1");
        assertThat(service.getShapeById("1")).isNull();
    }

    // ── updateShape ───────────────────────────────────────────────────────────

    @Test
    void updateShape_replacesShapeAtCorrectIndex() {
        service.addShape(circle("1"));

        ShapeDTO dto = new ShapeDTO();
        dto.id = "1"; dto.name = "circle"; dto.radius = 60;
        dto.fill = "#ff0000"; dto.stroke = "black"; dto.strokeWidth = 3; dto.draggable = true;
        Circle updated = new Circle(dto);
        service.updateShape(updated);

        List<Shape> shapes = service.getCurrentShapes();
        assertThat(shapes).hasSize(1);
        assertThat(shapes.get(0).getFill()).isEqualTo("#ff0000");
    }

    @Test
    void updateShape_pushesUndoEntry() {
        service.addShape(circle("1"));

        ShapeDTO dto = new ShapeDTO();
        dto.id = "1"; dto.name = "circle"; dto.radius = 60;
        dto.fill = "#changed"; dto.stroke = "black"; dto.strokeWidth = 3; dto.draggable = true;
        service.updateShape(new Circle(dto));

        List<Shape> afterUndo = service.undo();
        assertThat(afterUndo.get(0).getFill()).isEqualTo("#fff");
    }

    // ── clearAllShapes ────────────────────────────────────────────────────────

    @Test
    void clearAllShapes_emptiesListAndShapeMap() {
        service.addShape(circle("1"));
        service.addShape(square("2"));
        service.clearAllShapes();

        assertThat(service.getCurrentShapes()).isEmpty();
        assertThat(service.getShapeById("1")).isNull();
        assertThat(service.getShapeById("2")).isNull();
    }

    // ── string-based save / load ──────────────────────────────────────────────

    @Test
    void saveAsString_json_producesValidJson() throws IOException {
        service.addShape(circle("1"));
        String json = service.saveAsString("json", "5");

        ObjectMapper mapper = new ObjectMapper();
        var node = mapper.readTree(json);
        assertThat(node.get("idCounter").asText()).isEqualTo("5");
        assertThat(node.get("lastUpdate").size()).isEqualTo(1);
    }

    @Test
    void loadFromContent_json_restoresStateAndShapeMap() throws IOException {
        service.addShape(circle("1"));
        String json = service.saveAsString("json", "3");

        PaintService fresh = new PaintService();
        Save loaded = fresh.loadFromContent(json, "json");

        assertThat(loaded.getIdCounter()).isEqualTo("3");
        assertThat(fresh.getCurrentShapes()).hasSize(1);
        assertThat(fresh.getShapeById("1")).isNotNull();
    }

    @Test
    void saveAndLoad_xml_roundTrip() throws IOException {
        service.addShape(square("42"));
        String xml = service.saveAsString("xml", "10");

        PaintService fresh = new PaintService();
        fresh.loadFromContent(xml, "xml");

        assertThat(fresh.getCurrentShapes()).hasSize(1);
        assertThat(fresh.getCurrentShapes().get(0).getId()).isEqualTo("42");
    }

    @Test
    void saveAsString_unknownFormat_throws() {
        assertThatThrownBy(() -> service.saveAsString("csv", "1"))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
