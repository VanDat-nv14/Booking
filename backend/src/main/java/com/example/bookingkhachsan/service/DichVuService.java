package com.example.bookingkhachsan.service;

import com.example.bookingkhachsan.dto.DichVuDto;
import com.example.bookingkhachsan.entity.DichVu;
import com.example.bookingkhachsan.entity.KhachSan;
import com.example.bookingkhachsan.repository.DichVuRepository;
import com.example.bookingkhachsan.repository.KhachSanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DichVuService {

    private final DichVuRepository dichVuRepository;
    private final KhachSanRepository khachSanRepository;

    public List<DichVu> getServicesByHotel(Integer khachSanId) {
        return dichVuRepository.findByKhachSanId(khachSanId);
    }

    public DichVu createService(Integer managerId, DichVuDto dto) {
        KhachSan hotel = khachSanRepository.findByNguoiQuanLy_Id(managerId)
                .orElseThrow(() -> new RuntimeException("Bạn chưa quản lý khách sạn nào"));

        DichVu dichVu = new DichVu();
        dichVu.setTen(dto.getTen());
        dichVu.setGiaTien(dto.getGiaTien());
        dichVu.setDonViTinh(dto.getDonViTinh());
        dichVu.setKhachSan(hotel);

        return dichVuRepository.save(dichVu);
    }

    public DichVu updateService(Integer managerId, Integer serviceId, DichVuDto dto) {
        DichVu dichVu = dichVuRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Dịch vụ không tồn tại"));

        KhachSan hotel = khachSanRepository.findByNguoiQuanLy_Id(managerId)
                .orElseThrow(() -> new RuntimeException("Bạn chưa quản lý khách sạn nào"));

        if (!dichVu.getKhachSan().getId().equals(hotel.getId())) {
            throw new RuntimeException("Dịch vụ không thuộc khách sạn của bạn");
        }

        dichVu.setTen(dto.getTen());
        dichVu.setGiaTien(dto.getGiaTien());
        dichVu.setDonViTinh(dto.getDonViTinh());

        return dichVuRepository.save(dichVu);
    }

    public void deleteService(Integer managerId, Integer serviceId) {
        DichVu dichVu = dichVuRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Dịch vụ không tồn tại"));

        KhachSan hotel = khachSanRepository.findByNguoiQuanLy_Id(managerId)
                .orElseThrow(() -> new RuntimeException("Bạn chưa quản lý khách sạn nào"));

        if (!dichVu.getKhachSan().getId().equals(hotel.getId())) {
            throw new RuntimeException("Dịch vụ không thuộc khách sạn của bạn");
        }

        dichVuRepository.deleteById(serviceId);
    }
}
