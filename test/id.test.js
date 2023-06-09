// Copyright IBM Corp. 2015,2019. All Rights Reserved.
// Node module: loopback-connector-mssql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
require('./init.js');
const should = require('should');
const assert = require('assert');
const async = require('async');
let ds;

before(function() {
  /* global getDataSource */
  ds = getDataSource();
});

describe('Manipulating id column', function() {
  it('should auto generate id', function(done) {
    const schema =
      {
        name: 'WarehouseTest',
        options: {
          mssql: {
            schema: 'dbo',
            table: 'WAREHOUSE_TEST',
          },
        },
        properties: {
          id: {
            type: 'Number',
            id: true,
          },
          name: {
            type: 'String',
            required: false,
            length: 40,
          },
        },
      };

    const models = ds.modelBuilder.buildModels(schema);
    const Model = models.WarehouseTest;
    Model.attachTo(ds);

    ds.automigrate(function(err) {
      assert(!err);
      async.series([
        function(callback) {
          Model.destroyAll(callback);
        },
        function(callback) {
          Model.create({name: 'w1'},
            callback);
        },
        function(callback) {
          Model.create({name: 'w2'},
            callback);
        },
        function(callback) {
          Model.create({name: 'w3'},
            callback);
        },
        function(callback) {
          Model.find({order: 'id asc'},
            function(err, results) {
              assert(!err);
              results.should.have.lengthOf(3);
              for (let i = 0; i < results.length; i++) {
                should.equal(results[i].id, i + 1);
              }
              callback();
            });
        },
      ], done);
    });
  });

  it('should use manual id', function(done) {
    const schema =
      {
        name: 'WarehouseTest',
        options: {
          idInjection: false,
          mssql: {
            schema: 'dbo',
            table: 'WAREHOUSE_TEST',
          },
        },
        properties: {
          id: {
            type: 'Number',
            id: true,
            generated: false,
          },
          name: {
            type: 'String',
            required: false,
            length: 40,
          },
        },
      };

    const models = ds.modelBuilder.buildModels(schema);
    const Model = models.WarehouseTest;
    Model.attachTo(ds);

    ds.automigrate(function(err) {
      assert(!err);
      async.series([
        function(callback) {
          Model.destroyAll(callback);
        },
        function(callback) {
          Model.create({id: 501, name: 'w1'},
            callback);
        },
        function(callback) {
          Model.find({order: 'id asc'},
            function(err, results) {
              assert(!err);
              results.should.have.lengthOf(1);
              should.equal(results[0].id, 501);
              callback();
            });
        },
      ], done);
    });
  });

  it('should create composite key', function(done) {
    const schema =
      {
        name: 'CompositeKeyTest',
        options: {
          idInjection: false,
          mssql: {
            schema: 'dbo',
            table: 'COMPOSITE_KEY_TEST',
          },
        },
        properties: {
          idOne: {
            type: 'Number',
            id: true,
            generated: false,
          },
          idTwo: {
            type: 'Number',
            id: true,
            generated: false,
          },
          name: {
            type: 'String',
            required: false,
            length: 40,
          },
        },
      };

    const models = ds.modelBuilder.buildModels(schema);
    const Model = models.CompositeKeyTest;
    Model.attachTo(ds);

    ds.automigrate(function(err) {
      assert(!err);
      async.series([
        function(callback) {
          Model.destroyAll(callback);
        },
        function(callback) {
          Model.create({idOne: 1, idTwo: 2, name: 'w1'},
            callback);
        },
        function(callback) {
          ds.discoverPrimaryKeys('COMPOSITE_KEY_TEST', function(err, models) {
            if (err) return done(err);
            assert(models.length === 2);
            callback();
          });
        },
      ], done);
    });
  });

  it('should use bigint id', function(done) {
    const schema =
      {
        name: 'WarehouseTest',
        options: {
          idInjection: false,
          mssql: {
            schema: 'dbo',
            table: 'WAREHOUSE_TEST',
          },
        },
        properties: {
          id: {
            type: 'Number',
            id: true,
            generated: false,
            mssql: {
              dataType: 'bigint',
              dataPrecision: 20,
              dataScale: 0,
            },
          },
          name: {
            type: 'String',
            required: false,
            length: 40,
          },
        },
      };

    const models = ds.modelBuilder.buildModels(schema);
    const Model = models.WarehouseTest;
    Model.attachTo(ds);

    ds.automigrate(function(err) {
      assert(!err);
      async.series([
        function(callback) {
          Model.destroyAll(callback);
        },
        function(callback) {
          Model.create({id: 962744456683738, name: 'w1'},
            callback);
        },
        function(callback) {
          Model.find({order: 'id asc'},
            function(err, results) {
              assert(!err);
              results.should.have.lengthOf(1);
              should.equal(results[0].id, 962744456683738);
              callback();
            });
        },
      ], done);
    });
  });
});
