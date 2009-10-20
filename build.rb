#!/usr/bin/env ruby

# USAGE:
# 
# Full:
# ./build.rb

require 'rubygems'
require 'json'
require 'yaml'

module MooTools
  class Build
    
    attr_reader   :included
    attr_accessor :build_path
    attr_accessor :dependency_paths
    attr_accessor :data
    
    def initialize(opts={})
      @path             = opts[:path] || File.dirname(__FILE__)
      @build_path       = opts[:build_path] || @path + '/mooeditable.js'
      @dependency_paths = opts[:dependency_paths] || [@path + '/Source']
      @dependency_file  = opts[:dependency_file] || 'scripts.json'
      
      @scripts  = []
      @included = []
      @data     = {}
      
      
      @dependency_paths.each do |dependency_path|
        json = JSON.load(File.read( dependency_path + "/#{@dependency_file}" ))
        json.each_pair do |folder, group|
          group.each_pair do |script, properties|
            @scripts.push(script)
            @data[script] = {:folder => "#{dependency_path}/#{folder}", :deps => properties["deps"]}
          end
        end
      end
    end
    
    def full_build
      @scripts.each { |name| load_script name }
      @string
    end
    
    def load_script(name)
      return if @included.index(name) || name == 'None';
      unless @data.key? name
        puts "Script '#{name}' not found!"
        throw :script_not_found
      end
      puts "loading #{name}\n"
      @included.push name
      @data[name][:deps].each { |dep| load_script dep }
      @string ||= ""
      @string << File.read("#{@data[name][:folder]}/#{name}.js") << "\n"
    end
    
    def build
      @string ||= full_build
      @string.sub!('%build%', build_number)
    end
    alias :to_s :build
    
    def build_number
      begin
        ref =  File.read(File.dirname(__FILE__) + '/.git/HEAD').chomp.match(/ref: (.*)/)[1]
        return File.read(File.dirname(__FILE__) + "/.git/#{ref}").chomp
      rescue
        return ""
      end
    end
    
    def save(filename)
      File.open(filename, 'w') { |fh| fh.write to_s }
    end
    
    def save!
      save build_path
    end
    
    def self.build!(argv, mootools = MooTools::Build.new)
      catch :script_not_found do
        if argv.length > 0
          argv.each { |script| mootools.load_script(script) }
        else
          mootools.full_build
        end
      end
      
      puts "MooTools Built '#{mootools.build_path}'"
      print "  Included Scripts:","\n    "
      puts mootools.included.join(" ")
      mootools.save!      
    end
    
  end
end

if __FILE__ == $0
  
  conf = YAML.load_file('build.yml')
  if (File.exist?('build.local.yml'))
    local_conf = YAML.load_file('build.local.yml')
    conf.merge!(local_conf)
  end
  

  builder = MooTools::Build.new({
    :dependency_paths => conf[:dependency_paths], 
    :build_path => conf[:build_path]
  })

  MooTools::Build.build! ARGV, builder
  
end
